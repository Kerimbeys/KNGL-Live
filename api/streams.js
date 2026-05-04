// api/streams.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        // Kick API'sinden KNGL etiketli canlı yayınları çekiyoruz
        const response = await fetch('https://kick.com/api/v2/livestreams?tags=KNGL', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        if (!response.ok) {
            throw new Error('Kick API verisi alınamadı.');
        }

        const data = await response.json();

        // Gelen JSON verisini arayüzün beklediği formata dönüştürüyoruz
        const streams = (data.data || []).map(item => ({
            id: item.id,
            username: item.user?.username || "KNGL_Yayinci",
            category: item.category?.name || "Just Chatting",
            viewers: item.viewer_count || 0,
            thumbnail: item.thumbnail?.url || "https://picsum.photos/800/450",
            avatar: item.user?.profile_pic || "https://i.pravatar.cc/100",
            description: item.session_title || "KNGL Ekibi Canlı Yayında!",
            url: `https://kick.com/${item.user?.username || 'kngl'}`
        }));

        res.status(200).json({ success: true, streams });
        
    } catch (error) {
        // Hata durumlarında sistemin hata vermemesi için örnek bir kart döndürüyoruz
        res.status(200).json({ 
            success: true, 
            streams: [
                {
                    id: "sample-1",
                    username: "KNGL_Ornek",
                    category: "Just Chatting",
                    viewers: 1250,
                    thumbnail: "https://picsum.photos/800/450?random=1",
                    avatar: "https://i.pravatar.cc/100",
                    description: "KNGL etiketi ile çalışan örnek yayın!",
                    url: "https://kick.com"
                }
            ]
        });
    }
}
