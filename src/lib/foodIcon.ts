/** Picks an emoji for a food from its name. Works offline and for everything already logged.
    AI scans can also supply their own emoji, which takes priority (see iconOf). */

const RULES: [RegExp, string][] = [
  // Drinks
  [/protein shake|whey|shake|smoothie/, '🥤'],
  [/karak|chai|\btea\b|matcha/, '🍵'],
  [/coffee|latte|flat white|cappuccino|espresso|americano|mocha|cortado/, '☕'],
  [/\bjuice\b|lemonade/, '🧃'],
  [/\bmilk\b|laban|ayran/, '🥛'],
  [/cola|coke|pepsi|soda|sprite|energy drink|red bull|monster/, '🥤'],
  [/\bwater\b/, '💧'],
  // Dishes
  [/burger/, '🍔'],
  [/pizza/, '🍕'],
  [/shawarma|wrap|burrito|kebab roll|fajita/, '🌯'],
  [/taco|quesadilla/, '🌮'],
  [/falafel|hummus|mutabal|baba gan/, '🧆'],
  [/sandwich|club|panini|sub\b/, '🥪'],
  [/hot ?dog/, '🌭'],
  [/fries|chips/, '🍟'],
  [/sushi|maki|nigiri|sashimi|poke/, '🍣'],
  [/ramen|noodle|pho|udon|pad thai/, '🍜'],
  [/pasta|spaghetti|penne|lasagn|mac and cheese|fettuccine|alfredo/, '🍝'],
  [/biryani|machboos|majboos|kabsa|mandi|bukhari|pilaf|curry|masala|butter chicken|daal|dal\b/, '🍛'],
  [/fried rice|rice bowl|\brice\b/, '🍚'],
  [/soup|broth|stew/, '🍲'],
  [/salad|tabbouleh|fattoush/, '🥗'],
  [/kebab|kabab|tikka|skewer|kofta|grill/, '🍢'],
  [/steak|beef|brisket|ribeye|striploin|lamb|meat/, '🥩'],
  [/chicken|turkey|wings|nugget|tenders/, '🍗'],
  [/salmon|tuna|fish|hammour|cod|sea ?bass/, '🐟'],
  [/shrimp|prawn/, '🍤'],
  [/bacon/, '🥓'],
  [/omelet|omelette|\beggs?\b|shakshuka/, '🍳'],
  // Breakfast, dairy, grains
  [/pancake|crepe|french toast/, '🥞'],
  [/waffle/, '🧇'],
  [/oats|oatmeal|porridge|granola|cereal|muesli/, '🥣'],
  [/yogh?urt|labneh|skyr/, '🥣'],
  [/cheese|halloumi|feta/, '🧀'],
  [/croissant|pastry/, '🥐'],
  [/bagel/, '🥯'],
  [/toast|sourdough|bread|khubz|pita|naan|roti|chapati|paratha/, '🍞'],
  // Snacks and sweets
  [/protein bar|\bbar\b|chocolate/, '🍫'],
  [/cookie|biscuit/, '🍪'],
  [/ice cream|gelato/, '🍨'],
  [/cake|brownie|cheesecake|muffin|kunafa|baklava/, '🍰'],
  [/donut|doughnut/, '🍩'],
  [/dates?\b|tamr/, '🌴'],
  [/almond|nuts?\b|peanut|cashew|pistachio|walnut/, '🥜'],
  [/popcorn/, '🍿'],
  [/honey/, '🍯'],
  // Fruit and veg
  [/banana/, '🍌'],
  [/apple/, '🍎'],
  [/berr(y|ies)|strawberr/, '🍓'],
  [/orange|mandarin/, '🍊'],
  [/grape/, '🍇'],
  [/mango/, '🥭'],
  [/watermelon|melon/, '🍉'],
  [/avocado/, '🥑'],
  [/potato/, '🥔'],
  [/broccoli|vegetable|veg\b/, '🥦'],
  [/fruit/, '🍎'],
];

const FALLBACK = '🍽️';

export function iconFor(name: string): string {
  const n = name.toLowerCase();
  for (const [re, icon] of RULES) if (re.test(n)) return icon;
  return FALLBACK;
}

/** A stored emoji (chosen by Claude during a scan) wins; otherwise match on the name. */
export function iconOf(item: { name: string; icon?: string }): string {
  return item.icon || iconFor(item.name);
}
