from PIL import Image, ImageDraw

sizes = [192, 512]
color_bg = '#16a34a'
color_heart = 'white'

for size in sizes:
    img = Image.new('RGBA', (size, size), color_bg)
    d = ImageDraw.Draw(img)
    # 하트 좌표 (비율 기반)
    heart = [
        (size*0.5, size*0.75),
        (size*0.15, size*0.45),
        (size*0.35, size*0.15),
        (size*0.5, size*0.35),
        (size*0.65, size*0.15),
        (size*0.85, size*0.45)
    ]
    d.polygon(heart, fill=color_heart)
    img.save(f'icon-{size}x{size}.png') 