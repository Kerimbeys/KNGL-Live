// api/streams.js
export default async function handler(req, res) {
    // CORS izinleri (Gerekirse)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        // Gerçek bir senaryoda burada Kick API'sine istek atılır:
        // const response = await fetch('https://kick.com/api/v2/...)....
        
        // Şimdilik örnek (Mock) veri döndürüyoruz:
        const mockStreams = [
            {
                id: "1",
                username: "KNGL_Ahmet",
                category: "Just Chatting",
                viewers: 1250,
                thumbnail: "https://picsum.photos/800/450?random=1",
                avatar: "https://i.pravatar.cc/100?img=1",
                description: "KNGL etiketi ile yepyeni bir yayın! Sohbet ve oyun keyfi burada seni bekliyor.",
                url: "https://kick.com/kngl_ahmet"
            },
            {
                id: "2",
                username: "KNGL_Zeynep",
                category: "Valorant",
                viewers: 3420,
                thumbnail: "https://picsum.photos/800/450?random=2",
                avatar: "https://i.pravatar.cc/100?img=2",
                description: "KNGL ekibiyle rekabetçi rank kasmace! Kaçırma.",
                url: "https://kick.com/kngl_zeynep"
            }
        ];

        // Başarılı yanıt
        res.status(200).json({ success: true, streams: mockStreams });
    } catch (error) {
        res.status(500).json({ success: false, message: "Veri çekilemedi" });
    }
}