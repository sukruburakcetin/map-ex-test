"""Small deterministic PNG sprite atlas; standard library only, no browser graphics."""
import struct
import zlib

GROUPS = ('airport','bar','education','convenience','fuel','golf','grocery','health','lodging','parks','parking','rail','restaurant','shop','stadium','cafe','bakery','bank','government','worship','entertainment','beauty','fitness','automotive','office','landmarks','services','other')
COLORS = tuple(
    (173,67,70) if group=='health' else
    (56,125,77) if group in ('parks','golf','grocery') else
    (67,106,172) if group in ('education','airport','rail','parking','bank','government') else
    (135,87,155) if group in ('landmarks','worship','entertainment','stadium','beauty') else
    (164,109,46) if group in ('restaurant','cafe','bakery','bar','lodging','shop','convenience','fuel') else
    (93,111,115) for group in GROUPS)


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
        def line(x1,y1,x2,y2):
            steps=max(abs(x2-x1),abs(y2-y1),1)
            for step in range(steps+1):
                x=round(x1+(x2-x1)*step/steps);y=round(y1+(y2-y1)*step/steps)
                rect(x,y,2,2)
        if group=='airport':
            rect(11,5,2,14);line(6,12,11,9);line(12,9,17,12);rect(8,16,8,2)
        elif group=='bar':
            line(6,6,12,12);line(17,6,12,12);rect(6,6,12,2);rect(11,12,2,6);rect(8,18,8,1)
        elif group=='fuel':
            rect(7,6,8,13);rect(8,5,6,2);line(15,8,17,10);rect(17,10,2,6);line(16,16,17,16)
        elif group=='golf':
            rect(10,5,2,13);line(12,5,17,8);line(12,10,17,8);rect(7,18,11,2)
        elif group=='grocery':
            line(5,7,7,7);line(7,7,9,15);rect(9,14,9,2);rect(9,8,10,2);rect(17,9,2,5);rect(9,17,2,2);rect(16,17,2,2)
        elif group=='convenience':
            rect(6,10,12,9);rect(5,6,14,3);rect(8,5,10,2)
        elif group=='lodging':
            rect(5,8,2,11);rect(7,12,12,4);rect(17,10,2,9);rect(8,9,4,3)
        elif group=='parking':
            rect(8,6,2,13);rect(10,6,6,2);rect(15,7,2,6);rect(10,12,6,2)
        elif group=='rail':
            rect(7,5,10,11);rect(6,16,12,2);rect(8,18,2,2);rect(15,18,2,2);rect(5,10,2,2);rect(17,10,2,2)
        elif group=='restaurant':
            for x in (6,9,12):rect(x,5,1,6)
            rect(6,10,7,2);rect(9,11,2,8);rect(16,5,2,14)
        elif group=='stadium':
            line(6,8,17,8);line(6,16,17,16);line(5,9,5,14);line(18,9,18,14);rect(11,9,1,7)
        elif group=='cafe':
            rect(6,8,10,8);rect(7,16,8,2);rect(16,9,3,2);rect(17,11,2,3);rect(16,14,3,1);rect(9,5,2,2);rect(13,5,2,2)
        elif group=='bakery':
            rect(6,9,12,8);rect(8,6,8,3);rect(7,17,10,2)
        elif group=='bank':
            line(6,9,12,5);line(12,5,18,9)
            for x in (7,11,15):rect(x,11,2,6)
            rect(6,18,12,2)
        elif group=='government':
            rect(6,9,12,10);rect(11,5,2,5);rect(13,5,5,3)
        elif group=='worship':
            line(7,10,12,5);line(12,5,17,10);rect(7,12,10,7)
        elif group=='entertainment':
            rect(6,7,12,12);line(6,5,17,5)
            for x in (7,11,15):rect(x,3,2,3)
        elif group=='beauty':
            line(7,5,16,17);line(16,5,7,17);rect(5,15,4,4);rect(15,15,4,4)
        elif group=='fitness':
            rect(5,8,3,9);rect(8,10,2,5);rect(10,11,4,3);rect(14,10,2,5);rect(16,8,3,9)
        elif group=='automotive':
            rect(5,11,14,6);line(7,10,9,6);rect(9,6,6,2);line(15,6,17,10);rect(6,17,3,2);rect(15,17,3,2)
        elif group=='office':
            rect(6,9,12,10);rect(9,5,6,2);rect(8,7,2,3);rect(14,7,2,3);rect(11,11,2,4)
        elif group=='health':rect(10,6,4,12);rect(6,10,12,4)
        elif group=='education':
            rect(6,7,5,10);rect(13,7,5,10);rect(11,16,2,2)
        elif group=='parks':
            for y in range(6,15):rect(12-(y-6)//2,y,1+(y-6)//2*2,1)
            rect(11,14,3,5)
        elif group=='landmarks':
            for y in range(6,10):rect(12-(y-6)*2,y,1+(y-6)*4,1)
            for x in [7,11,15]:rect(x,10,2,7)
            rect(6,17,12,2)
        elif group in ('services','shop'):
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
