import type { PointCloudPoint } from '../../utils/pointCloudUtils';

type PointCloudGL = WebGLRenderingContext | WebGL2RenderingContext;

/** Mapillary reference origin: longitude/latitude in degrees, altitude in metres. */
export interface PointCloudReference { lng: number; lat: number; alt: number; }
export interface PointCloudAppearance {
  colorMode: string;
  baseAltitude: number;
  nudgeZ: number;
  groundMode: boolean;
}
/** Live inputs are read when colors change; no Widget or React state is retained. */
export interface PointCloudRendererDependencies {
  readAppearance(): PointCloudAppearance;
  readPixelRatio(): number;
  readOpaquePass(): number;
  groundHeightMeters: number;
  toEnu(lon: number, lat: number, altitude: number, referenceLon: number, referenceLat: number, referenceAltitude: number): number[];
  warn(...args: unknown[]): void;
}
/** Minimal SDK registration boundary. The SDK invokes onRemove to release GL state. */
export interface PointCloudRendererViewer {
  addCustomRenderer(renderer: PointCloudRendererCallbacks): unknown;
  removeCustomRenderer(id: string): unknown;
}
interface PointCloudRendererCallbacks {
  id: string;
  renderPass: number;
  onAdd(viewer: unknown, reference: PointCloudReference, context: PointCloudGL): void;
  onReference(viewer: unknown, reference: PointCloudReference): void;
  onRemove(viewer: unknown, context: PointCloudGL): void;
  render(context: PointCloudGL, viewMatrix: number[] | Float32Array, projectionMatrix: number[] | Float32Array): void;
}
interface PointCloudRendererState extends PointCloudRendererCallbacks {
  _gl: PointCloudGL | null;
  _program: WebGLProgram | null;
  _positionBuffer: WebGLBuffer | null;
  _highlightBuffer: WebGLBuffer | null;
  _colorBuffer: WebGLBuffer | null;
  _lassoBuffer: WebGLBuffer | null;
  _vertexCount: number;
  _modelMatrix: Float32Array;
  _points: PointCloudPoint[];
  _selectedIndex: number;
  _currentReference: PointCloudReference | null;
  _uViewMatrixLoc: WebGLUniformLocation | null;
  _uProjectionMatrixLoc: WebGLUniformLocation | null;
  _uModelMatrixLoc: WebGLUniformLocation | null;
  _uIsHighlightDrawLoc: WebGLUniformLocation | null;
  _uPixelRatioLoc: WebGLUniformLocation | null;
  _pixelRatio: number;
  _aPositionLoc: number;
  _aColorLoc: number;
  _aLassoLoc: number;
  _lastViewMatrix: Float32Array | null;
  _lastProjMatrix: Float32Array | null;
  updateLasso(indices: number[]): void;
  updateColors(): void;
  updatePoints(points: PointCloudPoint[]): void;
  setHighlight(index: number): void;
  updateHighlightBuffer(): void;
}
export interface PointCloudProjection {
  readonly viewMatrix: Float32Array;
  readonly projectionMatrix: Float32Array;
  readonly reference: PointCloudReference;
}

/** Owns one point-cloud renderer registration and its SDK callback state.
 * Map/crop geometry, acquisition, point order and lasso hit testing stay with their
 * existing callers. Reuse this owner for replacement clouds; it adds no requests,
 * animation loops, resize calls, or scheduling to the playback/render path.
 */
export class PointCloudViewerRenderer {
  private viewer: PointCloudRendererViewer | null = null;
  private renderer: PointCloudRendererState | null = null;
  private active = false;
  /** Bind SDK conversion and live appearance readers once for this widget instance. */
  constructor(private readonly dependencies: PointCloudRendererDependencies) {}

  /** True only after registration and the SDK's first reference/context callback.
   * This preserves the previous gate used before replacing an existing point set.
   */
  get ready(): boolean { return !!(this.active && this.renderer?._gl && this.renderer._currentReference); }

  /** Current index in the filtered viewer point array; -1 clears the highlight. */
  get selectedIndex(): number { return this.renderer?._selectedIndex ?? -1; }

  /** Last rendered projection for synchronous lasso hit testing.
   * Matrices/reference are borrowed read-only views, not new copies. SDK render
   * callbacks retain the existing matrix snapshots. Detach retains those snapshots
   * until replacement, matching the old runtime's cached-renderer lifetime.
   */
  getProjection(): PointCloudProjection | null {
    const renderer = this.renderer;
    if (!renderer?._lastViewMatrix || !renderer._lastProjMatrix || !renderer._currentReference) return null;
    return { viewMatrix: renderer._lastViewMatrix, projectionMatrix: renderer._lastProjMatrix, reference: renderer._currentReference };
  }

  /** Upload the supplied ordered subset using unshifted WGS84 positions.
   * Raw lon/lat are degrees; altitude and the SDK reference are metres. The
   * existing buffer update also clears lasso flags for the replaced index space.
   */
  updatePoints(points: PointCloudPoint[]): void { this.renderer?.updatePoints(points); }

  /** Re-read current color/ground/calibration inputs and upload the same RGBA policy. */
  updateColors(): void { this.renderer?.updateColors(); }

  /** Upload lasso flags indexed into the filtered viewer point array, not ObjectIDs. */
  updateLasso(indices: number[]): void { this.renderer?.updateLasso(indices); }

  /** Update one viewer highlight; callers retain their existing resize policy. */
  setHighlight(index: number): void { this.renderer?.setHighlight(index); }

  /** Replace the previous registration before constructing the next callback object.
   * Point arrays retain identity/order. A failed registration keeps the prior
   * cached callback state and warning behavior, without claiming an active owner.
   */
  attach(viewer: PointCloudRendererViewer | null, points: PointCloudPoint[]): boolean {
    if (!viewer) return false;
    this.detach();
    const renderer = this.createRenderer(points);
    try {
      viewer.addCustomRenderer(renderer);
      this.viewer = viewer; this.renderer = renderer; this.active = true;
      return true;
    } catch (error) {
      this.dependencies.warn('Could not attach point cloud viewer renderer:', error);
      return false;
    }
  }

  /** Unregister from the viewer that accepted the renderer, including replacement.
   * Mapillary owns invoking onRemove. Repeated detach is inert; a throwing SDK
   * removal still releases registration intent and preserves the existing warning.
   */
  detach(): void {
    if (!this.viewer || !this.active) return;
    try { this.viewer.removeCustomRenderer('point-cloud-renderer'); }
    catch (error) { this.dependencies.warn('Could not remove point cloud viewer renderer:', error); }
    this.active = false; this.viewer = null;
  }

  /** Build the original shaders and SDK callbacks without changing GL math/order.
   * Geometry conversion is injected so the same Mapillary SDK function is used.
   */
  private createRenderer(points: PointCloudPoint[]): PointCloudRendererState {
    const vsSource = `
            attribute vec3 aPosition;
            attribute vec4 aColor;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uModelMatrix;
            uniform float uIsHighlightDraw;
            uniform float uPixelRatio;
            varying float vIsHighlight;
            varying vec3 vColor;
            varying float vAlpha;

            void main(void) {
                gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
                if (uIsHighlightDraw > 0.5) {
                    gl_PointSize = 20.0 * uPixelRatio;
                    vIsHighlight = 1.0;
                } else {
                    gl_PointSize = 1.0 * uPixelRatio;
                    vIsHighlight = 0.0;
                }
                vColor = aColor.rgb / 255.0;
                vAlpha = aColor.a / 255.0; // Pass the Alpha channel to the fragment shader
            }
        `;

    const fsSource = `
            precision mediump float;
            varying float vIsHighlight;
            varying vec3 vColor;
            varying float vAlpha;

            void main(void) {
                // If Ground Mode sets Alpha to 0, kill the pixel instantly!
                if (vAlpha < 0.5) {
                    discard;
                }

                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);

                if (dist > 0.5) discard;

                if (vIsHighlight > 0.5) {
                    if (dist > 0.40) {
                        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.8);
                    } else if (dist > 0.30) {
                        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                    } else {
                        gl_FragColor = vec4(1.0, 0.9, 0.0, 1.0);
                    }
                } else {
                    // Soft point splatting for a dense cloud look
                    float alpha = (0.5 - dist) * 2.0;
                    gl_FragColor = vec4(vColor, alpha * 0.95);
                }
            }
        `;

    const dependencies = this.dependencies;
    const geodeticToEnu = dependencies.toEnu;
    const renderer: PointCloudRendererState = {
      id: "point-cloud-renderer",
      renderPass: dependencies.readOpaquePass(),
      _gl: null,
      _program: null,
      _positionBuffer: null,
      _highlightBuffer: null,
      _vertexCount: 0,
      _modelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
      _points: points,
      _selectedIndex: -1,
      _currentReference: null,
      _uViewMatrixLoc: null,
      _uProjectionMatrixLoc: null,
      _uModelMatrixLoc: null,
      _uIsHighlightDrawLoc: null,
      _uPixelRatioLoc: null,
      _pixelRatio: dependencies.readPixelRatio(),
      _aPositionLoc: -1,
      _colorBuffer: null as WebGLBuffer | null,
      _aColorLoc: -1,
      // Cache the last matrices for the getProjection() lasso contract.
      _lastViewMatrix: null as Float32Array | null,
      _lastProjMatrix: null as Float32Array | null,
      _lassoBuffer: null as WebGLBuffer | null,
      _aLassoLoc: -1,

      /** Upload 0/1 lasso flags in the current point-index space.
       * Shader attribute lookup/upload behavior is retained even when optimized out.
       */
      updateLasso(indices: number[]) {
        const gl = this._gl;
        if (!gl || !this._lassoBuffer) return;
        const data = new Float32Array(this._vertexCount);
        for (const idx of indices) {
          if (idx >= 0 && idx < this._vertexCount) data[idx] = 1.0;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this._lassoBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      },

      /** Read live appearance once per upload; retain the original height bands and alpha cutoff. */
      updateColors() {
        const gl = this._gl;
        if (!gl || !this._colorBuffer) return;

        const appearance = dependencies.readAppearance();
        const mode = appearance.colorMode;
        const base = appearance.baseAltitude;
        const nudgeZ = appearance.nudgeZ;
        const isGroundMode = appearance.groundMode;

        // Fallback to 1.5m to ensure it never fails
        const limit = dependencies.groundHeightMeters || 1.5;

        const colors: number[] = [];
        for (const p of this._points) {
          const relH = p.alt - base + nudgeZ;

          // Alpha flag: 255 = visible, 0 = hidden (Ground Mode)
          const a = isGroundMode && relH >= limit ? 0 : 255;

          if (mode === "elevation") {
            let r = 0,
              g = 0,
              b = 255;
            if (relH <= -0.5) {
              r = 0;
              g = 0;
              b = 255;
            } else if (relH <= 0.0) {
              r = 0;
              g = Math.round(((relH - -0.5) / 0.5) * 255);
              b = 255;
            } else if (relH <= 2.5) {
              r = 0;
              g = 255;
              b = Math.round((1 - (relH - 0.0) / 2.5) * 255);
            } else if (relH <= 7.0) {
              r = Math.round(((relH - 2.5) / 4.5) * 255);
              g = 255;
              b = 0;
            } else if (relH <= 15.0) {
              r = 255;
              g = Math.round((1 - (relH - 7.0) / 8.0) * 255);
              b = 0;
            } else {
              r = 255;
              g = 0;
              b = 0;
            }

            colors.push(r, g, b, a); // Push 4 values (RGBA)
          } else {
            colors.push(p.r ?? 160, p.g ?? 160, p.b ?? 160, a); // Push 4 values (RGBA)
          }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
        // DYNAMIC_DRAW allows real-time updates without breaking WebGL
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
      },

      /** Rebuild ENU positions/colors for the filtered array, then clear its lasso index buffer. */
      updatePoints(filteredPoints: PointCloudPoint[]) {
        const gl = this._gl;
        if (!gl || !this._positionBuffer || !this._colorBuffer || !this._currentReference) return;

        this._points = filteredPoints;
        this._vertexCount = filteredPoints.length;

        // Rebuild position buffer from filtered subset
        const positions: number[] = [];
        for (const p of filteredPoints) {
          const enu = geodeticToEnu(p.rawLon, p.rawLat, p.alt, this._currentReference.lng, this._currentReference.lat, this._currentReference.alt);
          positions.push(enu[0], enu[1], enu[2]);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);

        // Rebuild color buffer for the new subset
        this.updateColors();

        // [4.5.0 Update] Wipe the lasso buffer cleanly when slider crops the array
        // Prevents index-out-of-bounds WebGL crashes
        if (this._lassoBuffer) {
          gl.bindBuffer(gl.ARRAY_BUFFER, this._lassoBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertexCount), gl.DYNAMIC_DRAW);
        }
      },

      /** Retain the selected filtered-array index and update its separate position buffer. */
      setHighlight(index: number) {
        this._selectedIndex = index;
        this.updateHighlightBuffer();
      },

      /** Convert the selected raw WGS84 point to reference-relative ENU metres when ready. */
      updateHighlightBuffer() {
        const gl = this._gl;
        if (!gl || !this._highlightBuffer || !this._currentReference || this._selectedIndex < 0) return;

        const p = this._points[this._selectedIndex];
        if (!p) return;

        const enu = geodeticToEnu(p.rawLon, p.rawLat, p.alt, this._currentReference.lng, this._currentReference.lat, this._currentReference.alt);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._highlightBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(enu), gl.DYNAMIC_DRAW);
      },

      /** SDK attachment callback: compile the existing shaders and allocate buffers in original order. */
      onAdd(viewer: unknown, reference: PointCloudReference, context: PointCloudGL) {
        const gl = context;
        this._gl = gl;
        this._currentReference = reference;

        const compile = (type: number, src: string) => {
          const s = gl.createShader(type)!;
          gl.shaderSource(s, src);
          gl.compileShader(s);
          return s;
        };

        const vs = compile(gl.VERTEX_SHADER, vsSource);
        const fs = compile(gl.FRAGMENT_SHADER, fsSource);
        const program = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        this._program = program;

        this._uViewMatrixLoc = gl.getUniformLocation(program, "uViewMatrix");
        this._uProjectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
        this._uModelMatrixLoc = gl.getUniformLocation(program, "uModelMatrix");
        this._uIsHighlightDrawLoc = gl.getUniformLocation(program, "uIsHighlightDraw");
        this._aPositionLoc = gl.getAttribLocation(program, "aPosition");
        this._aColorLoc = gl.getAttribLocation(program, "aColor");
        // [4.5.0 Update] Bind the lasso attribute
        this._aLassoLoc = gl.getAttribLocation(program, "aLasso");
        this._uPixelRatioLoc = gl.getUniformLocation(program, "uPixelRatio");
        this._pixelRatio = dependencies.readPixelRatio();

        const positions: number[] = [];
        for (const p of this._points) {
          const enu = geodeticToEnu(p.rawLon, p.rawLat, p.alt, reference.lng, reference.lat, reference.alt);
          positions.push(enu[0], enu[1], enu[2]);
        }
        this._vertexCount = positions.length / 3;

        // [4.5.0 Update] Setup empty lasso buffer
        this._positionBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this._colorBuffer = gl.createBuffer()!;
        this.updateColors(); // Generate initial RGBA array

        this._highlightBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._highlightBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0]), gl.DYNAMIC_DRAW);

        this._lassoBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._lassoBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertexCount), gl.DYNAMIC_DRAW);
      },

      /** SDK reference change: rebuild positions/highlight in the new ENU origin without reordering points. */
      onReference(viewer: unknown, reference: PointCloudReference) {
        this._currentReference = reference;
        const gl = this._gl;
        if (!gl || !this._positionBuffer) return;

        const positions: number[] = [];
        for (const p of this._points) {
          const enu = geodeticToEnu(p.rawLon, p.rawLat, p.alt, reference.lng, reference.lat, reference.alt);
          positions.push(enu[0], enu[1], enu[2]);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this.updateHighlightBuffer();
      },

      /** SDK removal callback: retain the original GL deletion list and invalidate the live context. */
      onRemove(viewer: unknown, context: PointCloudGL) {
        const gl = context;
        if (this._program) gl.deleteProgram(this._program);
        if (this._positionBuffer) gl.deleteBuffer(this._positionBuffer);
        if (this._highlightBuffer) gl.deleteBuffer(this._highlightBuffer);
        if (this._colorBuffer) gl.deleteBuffer(this._colorBuffer);
        this._gl = null;
        this._program = null;
      },

      /** Snapshot camera matrices and draw points/highlight with the original depth and attribute order. */
      render(context: PointCloudGL, viewMatrix: number[] | Float32Array, projectionMatrix: number[] | Float32Array) {
        // [4.5.0 Update] Intercept and cache matrices for the outside Raycaster
        this._lastViewMatrix = new Float32Array(viewMatrix);
        this._lastProjMatrix = new Float32Array(projectionMatrix);
        const gl = context;
        const program = this._program;
        if (!program || !this._positionBuffer || this._vertexCount === 0) return;

        gl.useProgram(program);

        gl.uniformMatrix4fv(this._uViewMatrixLoc, false, viewMatrix);
        gl.uniformMatrix4fv(this._uProjectionMatrixLoc, false, projectionMatrix);
        gl.uniformMatrix4fv(this._uModelMatrixLoc, false, this._modelMatrix);
        if (this._uPixelRatioLoc) gl.uniform1f(this._uPixelRatioLoc, this._pixelRatio);

        gl.uniform1f(this._uIsHighlightDrawLoc, 0.0);

        gl.enableVertexAttribArray(this._aPositionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.vertexAttribPointer(this._aPositionLoc, 3, gl.FLOAT, false, 0, 0);

        if (this._aColorLoc >= 0 && this._colorBuffer) {
          gl.enableVertexAttribArray(this._aColorLoc);
          gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);

          // Tell WebGL to expect 4 numbers (RGBA) instead of 3!
          gl.vertexAttribPointer(this._aColorLoc, 4, gl.FLOAT, false, 0, 0);
        }

        // [4.5.0 Update] Tell GPU how to read the Lasso selection flags
        if (this._aLassoLoc >= 0 && this._lassoBuffer) {
          gl.enableVertexAttribArray(this._aLassoLoc);
          gl.bindBuffer(gl.ARRAY_BUFFER, this._lassoBuffer);
          gl.vertexAttribPointer(this._aLassoLoc, 1, gl.FLOAT, false, 0, 0);
        }

        gl.enable(gl.DEPTH_TEST);
        gl.depthMask(false);
        gl.drawArrays(gl.POINTS, 0, this._vertexCount);
        gl.depthMask(true);

        if (this._selectedIndex >= 0 && this._highlightBuffer) {
          gl.uniform1f(this._uIsHighlightDrawLoc, 1.0);
          gl.bindBuffer(gl.ARRAY_BUFFER, this._highlightBuffer);
          gl.vertexAttribPointer(this._aPositionLoc, 3, gl.FLOAT, false, 0, 0);
          gl.disableVertexAttribArray(this._aColorLoc);
          gl.vertexAttrib4f(this._aColorLoc, 255, 255, 0, 255);
          gl.disable(gl.DEPTH_TEST);
          gl.drawArrays(gl.POINTS, 0, 1);
          gl.enable(gl.DEPTH_TEST);
        }

        gl.disableVertexAttribArray(this._aPositionLoc);
        if (this._aColorLoc >= 0) gl.disableVertexAttribArray(this._aColorLoc);
        // [4.5.0 Update] Cleanup
        if (this._aLassoLoc >= 0) gl.disableVertexAttribArray(this._aLassoLoc);
      },
    };

    return renderer;
  }
}
