// api/streams.js
export default async function handler(req, res) {
    // CORS izinleri
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        // Kick API üzerinden canlı yayın verilerini çekiyoruz
        const response = await fetch('https://kick.com/api/v2/categories', {
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

        // Gelen veriyi işleyip filtreleme yapıyoruz
        // (Eğer API'niz farklı bir endpoint gerektiriyorsa buradaki yapıyı ona göre esnetebiliriz)
        const streams = (data || []).map(item => ({
            id: item.id || Math.random().toString(36),
            username: item.slug || "KNGL_Kullanici",
            category: item.category?.name || "Just Chatting",
            viewers: item.viewers_count || 0,
            thumbnail: item.thumbnail?.url || "https://picsum.photos/800/450",
            avatar: item.icon?.url || "https://i.pravatar.cc/100",
            description: item.session_title || "KNGL Ekibi Canlı Yayında!",
            url: `https://kick.com/${item.slug || 'kngl'}`
        })).filter(stream => 
            stream.description.toLowerCase().includes('kngl') || 
            stream.username.toLowerCase().includes('kngl')
        );

        res.status(200).json({ success: true, streams });
    } catch (error) {
        // Hata durumunda sistemin çökmemesi için alternatif mock veri döndürüyoruz
        res.status(500).json({ 
            success: false, 
            message: "API Hatası, örnek veriler kullanılıyor",
            streams: [
                {
                    id: "1",
                    username: "KNGL_Ornek",
                    category: "Just Chatting",
                    viewers: 1500,
                    thumbnail: "https://picsum.photos/800/450?random=1",
                    avatar: "https://i.pravatar.cc/100",
                    description: "KNGL ekibi yayında!",
                    url: "https://kick.com/"
                }
            ] 
        });
    }
}
