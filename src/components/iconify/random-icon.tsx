import { useMemo } from 'react';


export const useRandomIcon = (uniqueKey: string) => {
  const pngs = [
    'icons/fruits_and_vegetables/color/bok-choy.png',
    'icons/fruits_and_vegetables/color/mushroom.png',
    'icons/fruits_and_vegetables/color/kale.png',
    'icons/fruits_and_vegetables/color/peach.png',
    'icons/fruits_and_vegetables/color/grapefruit.png',
    'icons/fruits_and_vegetables/color/cauliflower.png',
    'icons/fruits_and_vegetables/color/lime.png',
    'icons/fruits_and_vegetables/color/potato.png',
    'icons/fruits_and_vegetables/color/corn.png',
    'icons/fruits_and_vegetables/color/chard.png',
    'icons/fruits_and_vegetables/color/coconut.png',
    'icons/fruits_and_vegetables/color/beet.png',
    'icons/fruits_and_vegetables/color/carrot.png',
    'icons/fruits_and_vegetables/color/blueberry.png',
    'icons/fruits_and_vegetables/color/pineapple.png',
    'icons/fruits_and_vegetables/color/artichoke.png',
    'icons/fruits_and_vegetables/color/mango.png',
    'icons/fruits_and_vegetables/color/tomato.png',
    'icons/fruits_and_vegetables/color/watermelon.png',
    'icons/fruits_and_vegetables/color/cherry.png',
    'icons/fruits_and_vegetables/color/orange.png',
    'icons/fruits_and_vegetables/color/apple.png',
    'icons/fruits_and_vegetables/color/date.png',
    'icons/fruits_and_vegetables/color/lychee.png',
    'icons/fruits_and_vegetables/color/kohlrabi.png',
    'icons/fruits_and_vegetables/color/plantain.png',
    'icons/fruits_and_vegetables/color/pear.png',
    'icons/fruits_and_vegetables/color/leek.png',
    'icons/fruits_and_vegetables/color/dragon-fruit.png',
    'icons/fruits_and_vegetables/color/collard-greens.png',
    'icons/fruits_and_vegetables/color/cucumber.png',
    'icons/fruits_and_vegetables/color/banana.png',
    'icons/fruits_and_vegetables/color/plum.png',
    'icons/fruits_and_vegetables/color/eggplant.png',
    'icons/fruits_and_vegetables/color/spinach.png',
    'icons/fruits_and_vegetables/color/cabbage.png',
    'icons/fruits_and_vegetables/color/strawberry.png',
    'icons/fruits_and_vegetables/color/lettuce.png',
    'icons/fruits_and_vegetables/color/jackfruit.png',
    'icons/fruits_and_vegetables/color/pumpkin.png',
    'icons/fruits_and_vegetables/color/radish.png',
    'icons/fruits_and_vegetables/color/kiwi.png',
    'icons/fruits_and_vegetables/color/soursop.png',
    'icons/fruits_and_vegetables/color/broccoli.png',
  ];
  
  
  return useMemo(() => {
    // Alternative hash function without bitwise operators
    let hash = 0;
    for (let i = 0; i < uniqueKey.length; i++) {
      hash = ((hash * 31) + uniqueKey.charCodeAt(i)) % 1000000007;
    }
    const index = Math.abs(hash) % pngs.length;
    return pngs[index];
  }, [uniqueKey]);
};