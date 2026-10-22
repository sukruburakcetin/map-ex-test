/** Mapillary field-note renderer: shader setup, buffer uploads, drawing and program/buffer cleanup live together. */
import { buildViewerNoteBuffers } from './viewerBuffers';
import type { NoteEnuProjector, ViewerNotePosition, ViewerNoteReference } from './viewerBuffers';

export interface FieldNoteViewerRendererDependencies {
  /** Read current image/notes on reference changes; undefined keeps the existing buffers when no image is selected. */
  getRelevantNotesOnReference: () => readonly ViewerNotePosition[] | undefined;
  getPointCloudVisible: () => boolean;
  getBaseAltitude: () => number;
  getPixelRatio: () => number;
  project: NoteEnuProjector;
}
export interface FieldNoteViewerRenderer {
  id: string;
  renderPass: number;
  onAdd(viewer: unknown, reference: ViewerNoteReference, context: WebGLRenderingContext): void;
  onReference(viewer: unknown, reference: ViewerNoteReference): void;
  updatePositions(notes: readonly ViewerNotePosition[]): void;
  onRemove(viewer: unknown, context: WebGLRenderingContext): void;
  render(context: WebGLRenderingContext, viewMatrix: Float32Array, projectionMatrix: Float32Array): void;
}

/**
 * Create one renderer per activation; allocate GPU resources only when Mapillary calls onAdd.
 * Keep shader source, render pass, point sizing, blending/depth operations and upload order unchanged.
 * Read live state through explicit callbacks instead of retaining the widget. Mapillary owns callback timing;
 * the caller owns registration/removal, activation flags and resize notifications.
 */
export function createFieldNoteViewerRenderer(relevantNotes: readonly ViewerNotePosition[], dependencies: FieldNoteViewerRendererDependencies): FieldNoteViewerRenderer {
    const vsSource = `
            attribute vec3 aPosition;
            attribute vec3 aColor;
            varying vec3 vColor;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uModelMatrix;
            uniform float uPixelRatio;

            void main(void) {
                vec4 pos = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
                gl_Position = pos;

                // Perspective scaling: shrinks marker as distance from camera increases
                // pos.w represents camera-space depth (distance in meters)
                float distance = max(pos.w, 2.0); // Guard against division by zero
                float baseSize = 350.0 * uPixelRatio; // Reference point size at ~10 meters

                // Scale point size inversely with distance, clamped between 8px and 60px
                gl_PointSize = clamp(baseSize / distance, 8.0 * uPixelRatio, 60.0 * uPixelRatio);

                vColor = aColor;
            }
        `;
    const fsSource = `
            precision mediump float;
            varying vec3 vColor;

            void main(void) {
                // Center texture coordinates around (0.0, 0.0)
                vec2 coord = gl_PointCoord - vec2(0.5);

                // Use Manhattan distance (abs(x) + abs(y)) to rasterize a diamond shape
                float manhattanDist = abs(coord.x) + abs(coord.y);

                // Discard fragments outside the diamond boundary
                if (manhattanDist > 0.5) discard;

                // Draw white border along the outer rim (between 0.38 and 0.5)
                if (manhattanDist > 0.38) {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White border
                } else {
                    gl_FragColor = vec4(vColor, 0.95); // Inner color (orange or green fill)
                }
            }
        `;

    const renderer: any = {
      id: "field-notes-renderer",
      renderPass: 3, // Transparent pass: renders on top of opaque imagery and point cloud
      _gl: null,
      _program: null,
      _positionBuffer: null,
      _colorBuffer: null,
      _modelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
      _currentReference: null,
      _vertexCount: 0,

      onAdd(viewer: any, reference: any, context: WebGLRenderingContext) {
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
        this._uPixelRatioLoc = gl.getUniformLocation(program, "uPixelRatio");
        this._aPositionLoc = gl.getAttribLocation(program, "aPosition");
        this._aColorLoc = gl.getAttribLocation(program, "aColor");

        this._positionBuffer = gl.createBuffer()!;
        this._colorBuffer = gl.createBuffer()!;

        this.updatePositions(relevantNotes);
      },

      onReference(viewer: any, reference: any) {
        this._currentReference = reference;
        // Recalculate 3D ENU positions when camera geographic reference updates
        const relevant = dependencies.getRelevantNotesOnReference();
        if (relevant) this.updatePositions(relevant);
      },

      updatePositions(notes: readonly ViewerNotePosition[]) {
        const gl = this._gl;
        if (!gl || !this._positionBuffer || !this._colorBuffer || !this._currentReference) return;

        this._vertexCount = notes.length;
        if (notes.length === 0) return;

        const { positions, colors } = buildViewerNoteBuffers(notes, this._currentReference, dependencies.getPointCloudVisible(), dependencies.getBaseAltitude(), dependencies.project);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
      },

      onRemove(viewer: any, context: WebGLRenderingContext) {
        const gl = context;
        if (this._program) gl.deleteProgram(this._program);
        if (this._positionBuffer) gl.deleteBuffer(this._positionBuffer);
        if (this._colorBuffer) gl.deleteBuffer(this._colorBuffer);
        this._gl = null;
      },

      render(context: WebGLRenderingContext, viewMatrix: Float32Array, projectionMatrix: Float32Array) {
        const gl = context;
        const program = this._program;
        if (!program || !this._positionBuffer || this._vertexCount === 0) return;

        gl.useProgram(program);

        gl.uniformMatrix4fv(this._uViewMatrixLoc, false, viewMatrix);
        gl.uniformMatrix4fv(this._uProjectionMatrixLoc, false, projectionMatrix);
        gl.uniformMatrix4fv(this._uModelMatrixLoc, false, this._modelMatrix);
        gl.uniform1f(this._uPixelRatioLoc, dependencies.getPixelRatio());

        gl.enableVertexAttribArray(this._aPositionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.vertexAttribPointer(this._aPositionLoc, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(this._aColorLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
        gl.vertexAttribPointer(this._aColorLoc, 3, gl.FLOAT, false, 0, 0);

        // Disable depth testing so markers remain visible and are not occluded by geometry
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.drawArrays(gl.POINTS, 0, this._vertexCount);

        // Restore WebGL state to prevent interfering with other Mapillary components
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);

        gl.disableVertexAttribArray(this._aPositionLoc);
        gl.disableVertexAttribArray(this._aColorLoc);
      },
    };

  return renderer;
}
