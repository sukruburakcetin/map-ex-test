"""Small deterministic PNG sprite atlas; standard library only, no browser graphics."""
import struct
import zlib

GROUPS = ('health', 'education', 'parks', 'landmarks', 'services', 'other')
COLORS = ((173,67,70),(67,106,172),(56,125,77),(135,87,155),(164,109,46),(93,111,115))


def make_sprite(scale=1):
    if scale not in (1,2): raise ValueError("Sprite scale must be 1 or 2")
    size=24
    width,height=size*len(GROUPS),size
    pixels=bytearray(width*height*4)
    white=(255,255,255,255)
    def put(x,y,color):
        if 0<=x<width and 0<=y<height:
            offset=(y*width+x)*4;pixels[offset:offset+4]=bytes(color)
    metadata={}
    for index,group in enumerate(GROUPS):
        start=index*size
        def rect(x,y,w,h):
            for py in range(y,y+h):
                for px in range(x,x+w):put(start+px,py,white)
        for y in range(size):
            for x in range(size):
                distance=(x-11.5)**2+(y-11.5)**2
                if distance<=121:put(start+x,y,white if distance>90 else (*COLORS[index],255))
        if group=='health':rect(10,6,4,12);rect(6,10,12,4)
        elif group=='education':
            rect(6,7,5,10);rect(13,7,5,10);rect(11,16,2,2)
        elif group=='parks':
            for y in range(6,15):rect(12-(y-6)//2,y,1+(y-6)//2*2,1)
            rect(11,14,3,5)
        elif group=='landmarks':
            for y in range(6,10):rect(12-(y-6)*2,y,1+(y-6)*4,1)
            for x in [7,11,15]:rect(x,10,2,7)
            rect(6,17,12,2)
        elif group=='services':
            rect(6,10,12,8);rect(9,6,6,2);rect(8,8,2,3);rect(14,8,2,3)
        else:
            for y in range(8,16):
                for x in range(8,16):
                    if (x-11.5)**2+(y-11.5)**2<=14:put(start+x,y,white)
        metadata[group]={'x':start,'y':0,'width':size,'height':size,'pixelRatio':1}
    if scale==2:
        expanded=bytearray()
        for y in range(height):
            row=b''.join(bytes(pixels[(y*width+x)*4:(y*width+x+1)*4])*2 for x in range(width))
            expanded.extend(row*2)
        pixels=expanded;width*=2;height*=2
        metadata={name:{key:(value*2 if key!='pixelRatio' else 2) for key,value in spec.items()} for name,spec in metadata.items()}
    def chunk(kind,data):
        return struct.pack('!I',len(data))+kind+data+struct.pack('!I',zlib.crc32(kind+data)&0xffffffff)
    scanlines=b''.join(b'\0'+pixels[y*width*4:(y+1)*width*4] for y in range(height))
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',width,height,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(scanlines))+chunk(b'IEND',b'')
    return png,metadata
