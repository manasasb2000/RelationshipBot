const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../knowledge/kundli');
fs.mkdirSync(dir, { recursive: true });

const nakshatras = [
  { name: "Ashwini", lord: "Ketu", gana: "Deva", yoni: "Ashwa", nadi: "Vata", rashiIndex: 0, pada: [1,2,3,4] },
  { name: "Bharani", lord: "Venus", gana: "Manushya", yoni: "Gaja", nadi: "Pitta", rashiIndex: 0, pada: [1,2,3,4] },
  { name: "Krittika", lord: "Sun", gana: "Rakshasa", yoni: "Mesha", nadi: "Kapha", rashiIndex: 0, pada: [1] },
  { name: "Rohini", lord: "Moon", gana: "Manushya", yoni: "Sarpa", nadi: "Kapha", rashiIndex: 1, pada: [1,2,3,4] },
  { name: "Mrigashira", lord: "Mars", gana: "Deva", yoni: "Sarpa", nadi: "Pitta", rashiIndex: 1, pada: [1,2] },
  { name: "Ardra", lord: "Rahu", gana: "Manushya", yoni: "Shvan", nadi: "Vata", rashiIndex: 2, pada: [1,2,3,4] },
  { name: "Punarvasu", lord: "Jupiter", gana: "Deva", yoni: "Marjara", nadi: "Vata", rashiIndex: 2, pada: [1,2,3] },
  { name: "Pushya", lord: "Saturn", gana: "Deva", yoni: "Mesha", nadi: "Pitta", rashiIndex: 3, pada: [1,2,3,4] },
  { name: "Ashlesha", lord: "Mercury", gana: "Rakshasa", yoni: "Marjara", nadi: "Kapha", rashiIndex: 3, pada: [1,2,3,4] },
  { name: "Magha", lord: "Ketu", gana: "Rakshasa", yoni: "Mushaka", nadi: "Kapha", rashiIndex: 4, pada: [1,2,3,4] },
  { name: "Purva Phalguni", lord: "Venus", gana: "Manushya", yoni: "Mushaka", nadi: "Pitta", rashiIndex: 4, pada: [1,2,3,4] },
  { name: "Uttara Phalguni", lord: "Sun", gana: "Manushya", yoni: "Gau", nadi: "Vata", rashiIndex: 4, pada: [1] },
  { name: "Hasta", lord: "Moon", gana: "Deva", yoni: "Mahisha", nadi: "Vata", rashiIndex: 5, pada: [1,2,3,4] },
  { name: "Chitra", lord: "Mars", gana: "Rakshasa", yoni: "Vyaghra", nadi: "Pitta", rashiIndex: 5, pada: [1,2] },
  { name: "Swati", lord: "Rahu", gana: "Deva", yoni: "Mahisha", nadi: "Kapha", rashiIndex: 6, pada: [1,2,3,4] },
  { name: "Vishakha", lord: "Jupiter", gana: "Rakshasa", yoni: "Vyaghra", nadi: "Kapha", rashiIndex: 6, pada: [1,2,3] },
  { name: "Anuradha", lord: "Saturn", gana: "Deva", yoni: "Mriga", nadi: "Pitta", rashiIndex: 7, pada: [1,2,3,4] },
  { name: "Jyeshtha", lord: "Mercury", gana: "Rakshasa", yoni: "Mriga", nadi: "Vata", rashiIndex: 7, pada: [1,2,3,4] },
  { name: "Mula", lord: "Ketu", gana: "Rakshasa", yoni: "Shvan", nadi: "Vata", rashiIndex: 8, pada: [1,2,3,4] },
  { name: "Purva Ashadha", lord: "Venus", gana: "Manushya", yoni: "Vanara", nadi: "Pitta", rashiIndex: 8, pada: [1,2,3,4] },
  { name: "Uttara Ashadha", lord: "Sun", gana: "Manushya", yoni: "Nakula", nadi: "Kapha", rashiIndex: 8, pada: [1] },
  { name: "Shravana", lord: "Moon", gana: "Deva", yoni: "Vanara", nadi: "Kapha", rashiIndex: 9, pada: [1,2,3,4] },
  { name: "Dhanishta", lord: "Mars", gana: "Rakshasa", yoni: "Simha", nadi: "Pitta", rashiIndex: 9, pada: [1,2] },
  { name: "Shatabhisha", lord: "Rahu", gana: "Rakshasa", yoni: "Ashwa", nadi: "Vata", rashiIndex: 10, pada: [1,2,3,4] },
  { name: "Purva Bhadrapada", lord: "Jupiter", gana: "Manushya", yoni: "Simha", nadi: "Vata", rashiIndex: 10, pada: [1,2,3] },
  { name: "Uttara Bhadrapada", lord: "Saturn", gana: "Manushya", yoni: "Gau", nadi: "Pitta", rashiIndex: 11, pada: [1,2,3,4] },
  { name: "Revati", lord: "Mercury", gana: "Deva", yoni: "Gaja", nadi: "Kapha", rashiIndex: 11, pada: [1,2,3,4] }
];

const rashis = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const nakshatrasData = nakshatras.map((n, i) => {
  const startDeg = (i * 13.333333).toFixed(3);
  const endDeg = ((i + 1) * 13.333333).toFixed(3);
  
  let desc = `${n.name} is the ${i+1}th nakshatra (spanning ${startDeg}° to ${endDeg}° in the zodiac). Lord: ${n.lord}. Gana: ${n.gana}. Yoni: ${n.yoni}. Nadi: ${n.nadi}. People born under ${n.name} exhibit traits corresponding to its ruling planet ${n.lord} and animal symbol ${n.yoni}. It is a ${n.gana} gana nakshatra.`;

  return {
    index: i,
    name: n.name,
    lord: n.lord,
    gana: n.gana,
    yoni: n.yoni,
    nadi: n.nadi,
    rashiIndex: n.rashiIndex,
    pada: n.pada,
    startDeg: parseFloat(startDeg),
    endDeg: parseFloat(endDeg),
    text: desc,
    license: "original"
  };
});

fs.writeFileSync(path.join(dir, 'nakshatras.json'), JSON.stringify(nakshatrasData, null, 2));

const koota_rules = {
  "varna": {
    "description": "Varna koota compares the spiritual/social compatibility. Max: 1 point.",
    "convention": "Rashi-based varna classification",
    "scoring": "1 if groom's varna is equal or higher than bride's, 0 otherwise",
    "rashiVarna": {
      "Aries": "Kshatriya", "Taurus": "Vaishya", "Gemini": "Shudra", "Cancer": "Brahmin", 
      "Leo": "Kshatriya", "Virgo": "Vaishya", "Libra": "Shudra", "Scorpio": "Brahmin", 
      "Sagittarius": "Kshatriya", "Capricorn": "Vaishya", "Aquarius": "Shudra", "Pisces": "Brahmin"
    },
    "varnaOrder": ["Brahmin", "Kshatriya", "Vaishya", "Shudra"],
    "text": "Varna assesses fundamental nature compatibility. Brahmin natures are spiritual, Kshatriya are warriors/leaders, Vaishya are merchants, Shudra are service-oriented. This koota carries 1 point."
  },
  "vashya": {
    "description": "Vashya assesses mutual attraction and influence. Max: 2 points.",
    "text": "Vashya koota carries 2 points and assesses control and mutual attraction between the partners based on Moon signs."
  },
  "tara": {
    "description": "Tara relates to health and longevity based on nakshatras. Max: 3 points.",
    "text": "Tara koota carries 3 points and is calculated by the distance between the birth nakshatras of the partners."
  },
  "yoni": {
    "description": "Yoni checks physical and sexual compatibility. Max: 4 points.",
    "text": "Yoni koota carries 4 points and assigns an animal to each nakshatra to measure sexual and biological compatibility."
  },
  "graha_maitri": {
    "description": "Graha Maitri measures mental compatibility and friendship. Max: 5 points.",
    "text": "Graha Maitri evaluates planetary friendship between the Moon sign lords of both partners, carrying 5 points."
  },
  "gana": {
    "description": "Gana looks at temperamental compatibility. Max: 6 points.",
    "text": "Gana koota carries 6 points. Nakshatras are divided into Deva, Manushya, and Rakshasa ganas, determining temperament."
  },
  "bhakoot": {
    "description": "Bhakoot or Rashi koota measures emotional and family welfare. Max: 7 points.",
    "text": "Bhakoot koota evaluates the relationship between the moon signs, checking for inauspicious intervals like 6/8, carrying 7 points."
  },
  "nadi": {
    "description": "Nadi evaluates genetic/physiological compatibility. Max: 8 points.",
    "text": "Nadi koota is the most crucial, carrying 8 points. Same-nadi combinations are considered highly problematic for health and progeny."
  }
};
fs.writeFileSync(path.join(dir, 'koota_rules.json'), JSON.stringify(koota_rules, null, 2));

const manglik_rules = {
  "description": "Manglik (Kuja) dosha occurs when Mars is in houses 1, 2, 4, 7, 8, or 12 from Lagna or Moon.",
  "convention": "6-house rule from Moon (and Lagna when available). Lahiri ayanamsa.",
  "houses": [1, 2, 4, 7, 8, 12],
  "cancellations": [
    { "condition": "Mars in own sign (Aries or Scorpio)", "widely_accepted": true },
    { "condition": "Mars in exaltation (Capricorn)", "widely_accepted": true },
    { "condition": "Both partners are Manglik", "widely_accepted": true, "note": "doshas cancel each other" }
  ],
  "tone_note": "Manglik dosha should never be presented as fatalistic.",
  "text": "Manglik dosha is studied when Mars occupies the 1st, 2nd, 4th, 7th, 8th, or 12th house. Cancellation conditions exist."
};
fs.writeFileSync(path.join(dir, 'manglik_rules.json'), JSON.stringify(manglik_rules, null, 2));

const dosha_rules = {
  "nadi_dosha": {
    "description": "Nadi dosha occurs when both partners share the same Nadi (Vata/Pitta/Kapha).",
    "convention": "Nakshatra-based nadi classification",
    "three_nadis": {
      "Vata": ["Ashwini", "Ardra", "Punarvasu", "Uttara Phalguni", "Hasta", "Jyeshtha", "Mula", "Shatabhisha", "Purva Bhadrapada"],
      "Pitta": ["Bharani", "Mrigashira", "Pushya", "Purva Phalguni", "Chitra", "Anuradha", "Purva Ashadha", "Dhanishta", "Uttara Bhadrapada"],
      "Kapha": ["Krittika", "Rohini", "Ashlesha", "Magha", "Swati", "Vishakha", "Uttara Ashadha", "Shravana", "Revati"]
    },
    "cancellations": [
      { "condition": "Different rashis, same nadi" },
      { "condition": "Different nakshatra within same nadi" }
    ],
    "text": "Nadi dosha is the most significant dosha in Ashtakoot matching. Occurs on same Nadi. Cancellations exist."
  },
  "bhakoot_dosha": {
    "description": "Bhakoot dosha arises from inauspicious rashi relationships: 6/8, 9/5, or 12/2.",
    "convention": "Moon rashi-based counting",
    "inauspicious_patterns": ["6/8", "9/5", "12/2"],
    "cancellations": [
      { "condition": "Lords of both rashis are friends" }
    ],
    "text": "Bhakoot dosha arises when the Moon signs of the two partners form a 6/8, 9/5, or 12/2 relationship. Cancelled if lords are friends."
  }
};
fs.writeFileSync(path.join(dir, 'dosha_rules.json'), JSON.stringify(dosha_rules, null, 2));

