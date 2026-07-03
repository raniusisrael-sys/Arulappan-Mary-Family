// 📜 Ranius Buddy's Family Daily Bread Scripture Vault
const BIBLE_VERSES_VAULT = [
    { text: "But as for me and my house, we will serve the Lord.", tamil: "நானோ என் வீட்டாருமோவென்றால், கர்த்தரையே சேவிப்போம்.", ref: "யோசுவா / Joshua 24:15" },
    { text: "Believe in the Lord Jesus, and you will be saved, you and your household.", tamil: "கர்த்தராகிய இயேசு கிறிஸ்துவை விசுவாசி, அப்பொழுது நீயும் உன் வீட்டாரும் இரட்சிக்கப்படுவீர்கள்.", ref: "அப்போஸ்தலர் / Acts 16:31" },
    { text: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.", tamil: "கர்த்தர் உன்னை ஆசீர்வதித்து, உன்னைக் காக்கக்கடவர்; கர்த்தர் தம்முடைய முகத்தை உன்மேல் பிரகாசிப்பித்து, உன்மேல் கிருபையாயிருக்கக்கடவர்.", ref: "எண்ணாகமம் / Numbers 6:24-25" },
    { text: "I can do all things through Christ who strengthens me.", tamil: "என்னைப் பெலப்படுத்துகிற கிறிஸ்துவினாலே எல்லாவற்றையும் செய்ய எனக்குப் பெலனுண்டு.", ref: "பிலிப்பியர் / Philippians 4:13" },
    { text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.", tamil: "நீங்கள் எதிர்பாரத்திருக்கும் முடிவை உங்களுக்குக் கொடுக்கும்படிக்கு, நான் உங்களைக்குறித்து நினைத்திருக்கிற நினைவுகளை அறிவேன் என்று கர்த்தர் சொல்லுகிறார்; அவைகள் தீமைக்கல்ல, சமாதானத்துக்கேதுவான நினைவுகள்.", ref: "எரேமியா / Jeremiah 29:11" },
    { text: "Commit your way to the Lord; trust in him, and he will act.", tamil: "உன் வழியைக் கர்த்தருக்கு ஒப்புவித்து, அவர்மேல் நம்பிக்கையாயிரு; அவரே காரியத்தை வாய்க்கப்பண்ணுவார்.", ref: "சங்கீதம் / Psalm 37:5" },
    { text: "The Lord is my shepherd; I shall not want.", tamil: "கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன்.", ref: "சங்கீதம் / Psalm 23:1" },
    { text: "As for God, his way is perfect: The Lord’s word is flawless; he shields all who take refuge in him.", tamil: "தேவனுடைய வழி உத்தமமானது; கர்த்தருடைய வசனம் புடமிடப்பட்டது; தம்மை நம்புகிற அனைவருக்கும் அவர் கேடகமாயிருக்கிறார்.", ref: "சங்கீதம் / Psalm 18:30" },
    { text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you.", tamil: "முதலாவது தேவனுடைய ராஜ்யத்தையும் அவருடைய நீதியையும் தேடுங்கள், அப்பொழுது இவைகளெல்லாம் உங்களுக்குக் கூடக் கொடுக்கப்படும்.", ref: "மத்தேயு / Matthew 6:33" },
    { text: "And absolute peace from God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.", tamil: "எல்லா புத்திக்கும் மேலான தேவ சமாதானம் உங்கள் இருதயங்களையும் உங்கள் சிந்தைகளையும் கிறிஸ்து இயேசுவுக்குள்ளாகக் காத்துக்கொள்ளும்.", ref: "பிலிப்பியர் / Philippians 4:7" }
];

// Helper to let app.js easily grab the date-matched verse without page clashing
function getCalculatedDailyVerseObject() {
    const today = new Date();
    const dateKey = (today.getFullYear() * 10000) + ((today.getMonth() + 1) * 100) + today.getDate();
    const verseIndex = dateKey % BIBLE_VERSES_VAULT.length;
    return BIBLE_VERSES_VAULT[verseIndex];
}
