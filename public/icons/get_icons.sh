#!/bin/bash

# Arrays of categories
animals=(
    'dog' 'cat' 'cow' 'horse' 'bird' 'fish' 'lion' 'tiger' 'bear' 'rabbit'
    'elephant' 'giraffe' 'zebra' 'monkey' 'kangaroo' 'panda' 'fox' 'wolf' 'deer' 'squirrel'
    'chipmunk' 'raccoon' 'hedgehog' 'otter' 'beaver' 'mouse' 'rat' 'hamster' 'gerbil' 'guinea pig'
    'ferret' 'skunk' 'badger' 'moose' 'elk' 'bison' 'buffalo' 'antelope' 'gazelle' 'wildebeest'
    'rhinoceros' 'hippopotamus' 'camel' 'llama' 'alpaca' 'goat' 'sheep' 'pig' 'chicken' 'duck'
    'goose' 'turkey' 'pigeon' 'crow' 'eagle' 'hawk' 'owl' 'parrot' 'sparrow' 'robin'
    'blue jay' 'woodpecker' 'hummingbird' 'penguin' 'flamingo' 'pelican' 'swan' 'ostrich' 'emu' 'peacock'
    'seagull' 'vulture' 'falcon' 'bat' 'frog' 'toad' 'turtle' 'tortoise' 'snake' 'lizard'
    'alligator' 'crocodile' 'dinosaur' 'whale' 'dolphin' 'shark' 'octopus' 'squid' 'jellyfish' 'crab'
    'lobster' 'shrimp' 'seal' 'walrus' 'sea lion' 'manatee' 'starfish' 'urchin' 'clam' 'oyster'
)

fruits_and_vegetables=(
    'apple' 'banana' 'orange' 'strawberry' 'grape' 'watermelon' 'pineapple' 'mango' 'kiwi' 'blueberry'
    'peach' 'pear' 'cherry' 'plum' 'raspberry' 'blackberry' 'lemon' 'lime' 'grapefruit' 'pomegranate'
    'cantaloupe' 'honeydew' 'apricot' 'nectarine' 'fig' 'date' 'coconut' 'avocado' 'tomato' 'cucumber'
    'carrot' 'broccoli' 'spinach' 'lettuce' 'potato' 'onion' 'garlic' 'bell pepper' 'corn' 'pea'
    'green bean' 'zucchini' 'eggplant' 'squash' 'pumpkin' 'sweet potato' 'beet' 'radish' 'celery' 'asparagus'
    'cabbage' 'cauliflower' 'brussels sprouts' 'kale' 'artichoke' 'green onion' 'leek' 'mushroom' 'ginger' 'turnip'
    'parsnip' 'rutabaga' 'bok choy' 'collard greens' 'swiss chard' 'arugula' 'endive' 'watercress' 'okra' 'rhubarb'
    'cranberry' 'currant' 'gooseberry' 'persimmon' 'guava' 'passion fruit' 'lychee' 'dragon fruit' 'star fruit' 'kumquat'
    'tenderine' 'clementine' 'mandarin' 'boysenberry' 'loganberry' 'elderberry' 'mulberry' 'plantain' 'jackfruit' 'breadfruit'
    'durian' 'rambutan' 'soursop' 'acai' 'black currant' 'red currant' 'white currant' 'quince' 'jicama' 'daikon'
    'fennel' 'shallot' 'chive' 'yam' 'butternut squash' 'acorn squash' 'spaghetti squash' 'pattypan squash' 'chard' 'kohlrabi'
)

things_that_go=(
    'airplane' 'car' 'train' 'bus' 'bicycle' 'motorcycle' 'boat' 'ship' 'helicopter' 'submarine'
    'rocket' 'zeppelin' 'hot air balloon' 'scooter' 'skateboard' 'rollerblades' 'truck' 'tractor' 'taxi' 'ambulance'
    'fire engine' 'police car' 'van' 'sailboat' 'canoe' 'kayak' 'ferry' 'tram' 'metro' 'spaceship'
)

places=(
    'restaurant' 'airport' 'museum' 'park' 'beach' 'school' 'hospital' 'library' 'mall' 'stadium'
    'hotel' 'cinema' 'theater' 'cafe' 'bakery' 'supermarket' 'bank' 'post office' 'gym' 'pool'
    'church' 'temple' 'mosque' 'castle' 'forest' 'mountain' 'island' 'river' 'lake' 'city'
)

download_icon() {
    local animal_name="$1"
    local version="$2"
    local lib="$3"
    local size="$4"
    local output_dir="$5"
    
    # Create safe filename by replacing spaces with hyphens
    local safe_name="${animal_name// /-}"
    local filename
    if [ "$version" -eq 0 ]; then
        filename="${safe_name}.png"
    else
        filename="${safe_name}--v${version}.png"
    fi
    
    # FIXED: Correct URL format
    local url="https://img.icons8.com/${lib}/${size}/${filename}"
    
    # Create output directory if needed
    mkdir -p "$output_dir"
    
    # FIXED: Correct output path assignment
    local output_path="${output_dir}/${filename}"
    
    # Print the command
    echo "Executing: curl -k -o \"$output_path\" \"$url\""
    
    # Use curl instead of wget
    if curl -k -s -o "$output_path" "$url"; then
        echo "Downloaded: $output_path"
        return 0
    else
        echo "Error downloading $animal_name (v$version) for lib=$lib, size=$size"
        rm -f "$output_path"
        return 1
    fi
}

# Function to process a specific category
process_category() {
    local category_name="$1"
    local output_dir="$2"
    
    local libs=('cotton' 'color' 'puffy' 'carbon-copy')
    local sizes=(512 500 480 400 300 256 240 144 128 96)
    
    # Use eval to get the array by name (compatible with older bash)
    eval "local category_array=(\"\${${category_name}[@]}\")"
    
    for lib in "${libs[@]}"; do
        local lib_output_dir="${output_dir}/${lib}"
        for name in "${category_array[@]}"; do
            local found=0
            for size in "${sizes[@]}"; do
                if download_icon "$name" 0 "$lib" "$size" "$lib_output_dir"; then
                    found=1
                    break
                fi
            done
        done
    done
    
    echo "Finished processing $output_dir"
}

# Main execution
main() {
    echo "Starting icon downloads..."
    
    process_category "animals" "./animals"
    process_category "fruits_and_vegetables" "./fruits_and_vegetables"
    process_category "things_that_go" "./things_that_go"
    process_category "places" "./places"
    
    echo "All downloads completed!"
}

# Run the main function
main "$@"