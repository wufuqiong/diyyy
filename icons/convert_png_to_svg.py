#!/usr/bin/env python3
"""
Use a proper SVG conversion tool that handles color images
"""

import os
import subprocess
from pathlib import Path

def convert_with_imagemagick_vector(input_path, output_path):
    """Use ImageMagick's vector tracing (if available)"""
    try:
        # Try ImageMagick's vector tracing
        result = subprocess.run([
            'convert', str(input_path), 
            '-colorspace', 'RGB',
            '-resize', '500x500>',  # Resize for better tracing
            '-alpha', 'remove',     # Remove transparency
            '-density', '150',
            str(output_path)
        ], capture_output=True, text=True)
        
        return result.returncode == 0
    except:
        return False

def convert_with_autotrace(input_path, output_path):
    """Use autotrace which handles color better than potrace"""
    try:
        result = subprocess.run([
            'autotrace',
            '--input-format', 'png',
            '--output-format', 'svg',
            '--output-file', str(output_path),
            str(input_path)
        ], capture_output=True, text=True)
        return result.returncode == 0
    except:
        return False

def convert_with_vtracer(input_path, output_path):
    """Use vtracer - modern tool for color image vectorization"""
    try:
        result = subprocess.run([
            'vtracer',
            '--input', str(input_path),
            '--output', str(output_path),
            '--colormode', 'color',
            '--hierarchical', 'stacked'
        ], capture_output=True, text=True)
        return result.returncode == 0
    except:
        return False

def simple_wrap_png_in_svg(input_path, output_path):
    """
    Create an SVG that wraps the PNG (preserves colors, not true vector)
    But at least it won't be black!
    """
    import base64
    
    with open(input_path, 'rb') as f:
        png_data = base64.b64encode(f.read()).decode('utf-8')
    
    # Get image dimensions
    from PIL import Image
    with Image.open(input_path) as img:
        width, height = img.size
    
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" 
         xmlns:xlink="http://www.w3.org/1999/xlink"
         width="{width}" height="{height}" viewBox="0 0 {width} {height}">
    <image width="{width}" height="{height}" 
           xlink:href="data:image/png;base64,{png_data}"/>
</svg>'''
    
    with open(output_path, 'w') as f:
        f.write(svg_content)
    
    return True

def batch_convert_color_images(input_folder, output_folder=None):
    """Convert color PNGs using the best available method"""
    input_path = Path(input_folder)
    
    if output_folder is None:
        output_folder = input_folder
    output_path = Path(output_folder)
    output_path.mkdir(parents=True, exist_ok=True)
    
    png_files = list(input_path.glob('*.png'))
    
    if not png_files:
        print("No PNG files found")
        return
    
    print(f"Converting {len(png_files)} color PNG files...")
    
    for png_file in png_files:
        svg_file = output_path / f"{png_file.stem}.svg"
        print(f"Converting: {png_file.name}")
        
        # Try methods in order of preference
        methods = [
            ("VTracer", convert_with_vtracer),
            ("AutoTrace", convert_with_autotrace),
            ("ImageMagick Vector", convert_with_imagemagick_vector),
            ("PNG Wrapper", simple_wrap_png_in_svg),
        ]
        
        success = False
        for method_name, converter in methods:
            print(f"  Trying {method_name}...", end=" ")
            if converter(png_file, svg_file):
                print("✓ Success")
                success = True
                break
            else:
                print("✗ Failed")
        
        if not success:
            print(f"  ✗ All methods failed for {png_file.name}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python3 convert_color_png.py <input_folder> [output_folder]")
        sys.exit(1)
    
    batch_convert_color_images(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)