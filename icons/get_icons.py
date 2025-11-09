import os
import urllib.request
import ssl
import time

animals = [
    'dog', 'cat', 'cow', 'horse', 'bird', 'fish', 'lion', 'tiger', 'bear', 'rabbit',
    'elephant', 'giraffe', 'zebra', 'monkey', 'kangaroo', 'panda', 'fox', 'wolf', 'deer', 'squirrel',
    'chipmunk', 'raccoon', 'hedgehog', 'otter', 'beaver', 'mouse', 'rat', 'hamster', 'gerbil', 'guinea pig',
    'ferret', 'skunk', 'badger', 'moose', 'elk', 'bison', 'buffalo', 'antelope', 'gazelle', 'wildebeest',
    'rhinoceros', 'hippopotamus', 'camel', 'llama', 'alpaca', 'goat', 'sheep', 'pig', 'chicken', 'duck',
    'goose', 'turkey', 'pigeon', 'crow', 'eagle', 'hawk', 'owl', 'parrot', 'sparrow', 'robin',
    'blue jay', 'woodpecker', 'hummingbird', 'penguin', 'flamingo', 'pelican', 'swan', 'ostrich', 'emu', 'peacock',
    'seagull', 'vulture', 'falcon', 'bat', 'frog', 'toad', 'turtle', 'tortoise', 'snake', 'lizard',
    'alligator', 'crocodile', 'dinosaur', 'whale', 'dolphin', 'shark', 'octopus', 'squid', 'jellyfish', 'crab',
    'lobster', 'shrimp', 'seal', 'walrus', 'sea lion', 'manatee', 'starfish', 'urchin', 'clam', 'oyster'
]
fruits_and_vegetables = [
    'apple', 'banana', 'orange', 'strawberry', 'grape', 'watermelon', 'pineapple', 'mango', 'kiwi', 'blueberry',
    'peach', 'pear', 'cherry', 'plum', 'raspberry', 'blackberry', 'lemon', 'lime', 'grapefruit', 'pomegranate',
    'cantaloupe', 'honeydew', 'apricot', 'nectarine', 'fig', 'date', 'coconut', 'avocado', 'tomato', 'cucumber',
    'carrot', 'broccoli', 'spinach', 'lettuce', 'potato', 'onion', 'garlic', 'bell pepper', 'corn', 'pea',
    'green bean', 'zucchini', 'eggplant', 'squash', 'pumpkin', 'sweet potato', 'beet', 'radish', 'celery', 'asparagus',
    'cabbage', 'cauliflower', 'brussels sprouts', 'kale', 'artichoke', 'green onion', 'leek', 'mushroom', 'ginger', 'turnip',
    'parsnip', 'rutabaga', 'bok choy', 'collard greens', 'swiss chard', 'arugula', 'endive', 'watercress', 'okra', 'rhubarb',
    'cranberry', 'currant', 'gooseberry', 'persimmon', 'guava', 'passion fruit', 'lychee', 'dragon fruit', 'star fruit', 'kumquat',
    'tangerine', 'clementine', 'mandarin', 'boysenberry', 'loganberry', 'elderberry', 'mulberry', 'plantain', 'jackfruit', 'breadfruit',
    'durian', 'rambutan', 'soursop', 'acai', 'black currant', 'red currant', 'white currant', 'quince', 'jicama', 'daikon',
    'fennel', 'shallot', 'chive', 'yam', 'butternut squash', 'acorn squash', 'spaghetti squash', 'pattypan squash', 'chard', 'kohlrabi'
]
things_that_go = [
    'airplane', 'car', 'train', 'bus', 'bicycle', 'motorcycle', 'boat', 'ship', 'helicopter', 'submarine',
    'rocket', 'zeppelin', 'hot air balloon', 'scooter', 'skateboard', 'rollerblades', 'truck', 'tractor', 'taxi', 'ambulance',
    'fire engine', 'police car', 'van', 'sailboat', 'canoe', 'kayak', 'ferry', 'tram', 'metro', 'spaceship'
]
places = [
    'restaurant', 'airport', 'museum', 'park', 'beach', 'school', 'hospital', 'library', 'mall', 'stadium',
    'hotel', 'cinema', 'theater', 'cafe', 'bakery', 'supermarket', 'bank', 'post office', 'gym', 'pool',
    'church', 'temple', 'mosque', 'castle', 'forest', 'mountain', 'island', 'river', 'lake', 'city'
]
def download_animal_icon(animal_name, version=1, lib='cotton', size=96, output_dir="."):
    """
    Downloads an animal icon from icons8.com
    
    Args:
        animal_name (str): Animal name in lowercase (e.g., 'dog')
        version (int): Icon version number (default=1)
        output_dir (str): Output directory (default=current directory)
    """
    # Create safe filename by replacing spaces with hyphens
    safe_name = animal_name.replace(' ', '-')
    if version == 0:
        filename = f"{safe_name}.png"
    else:
        filename = f"{safe_name}--v{version}.png"
    url = f"https://img.icons8.com/{lib}/{size}/{filename}"
    
    # Create output directory if needed
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, filename)
    
    # Create unverified SSL context (equivalent to --no-check-certificate)
    ssl_context = ssl._create_unverified_context()
    
    try:
        # Use urlopen with the SSL context, then save the file
        response = urllib.request.urlopen(url, context=ssl_context)
        with open(output_path, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Downloaded: {output_path}")
        return True
    except Exception as e:
        print(f"Error downloading {animal_name} (v{version}): {e}")
        return False

def walk_icons(name_list, output_dir="."):
    libs = ['cotton', 'color', 'puffy', 'carbon-copy']
    sizes = [512, 500, 480, 400, 300, 256, 240, 144, 128, 96]
    for lib in libs:
        output_dir_name = '/'.join([output_dir, lib])
        for name in name_list:
            found = False
            i = 0
            size = 0
            while not found and i < len(sizes):
                size = sizes[i]
                time.sleep(1)
                if not download_animal_icon(name, 0, lib=lib, size=size, output_dir=output_dir_name):
                    i += 1
                else:
                    found = True

    print("Finished.")

walk_icons(animals, output_dir='./animals')
walk_icons(fruits_and_vegetables, output_dir='./fruits_and_vegetables')
walk_icons(things_that_go, output_dir='./things_that_go')
walk_icons(places, output_dir='./places')
