export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        // Doğrudan Kick API'sine bağlanmayı deniyoruz
        const targetUrl = 'https://kick.com/api/v2/livestreams?tags=KNGL';
        
        // Alternatif Proxy servisi kullanıyoruz
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Proxy yanıt vermedi: ${response.status}`);
        }

        const rawData = await response.json();
        const data = JSON.parse(rawData.contents);

        // API'den dönen ana veriyi kontrol ediyoruz
        const items = data.data || data;

        if (!items || items.length === 0) {
            // Hiç yayın bulunamadıysa uyarı mesajı ver
            return res.status(200).json({
                success: false,
                message: "KNGL etiketine sahip aktif yayın bulunamadı.",
                streams: []
            });
        }

        const streams = items.map(item => ({
            id: item.id || Math.random(),
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
        console.error("API Veri Çekme Hatası:", error);

        // Hata durumunda uygulamanın kilitlenmemesi ve hata detayını göstermesi için
        res.status(500).json({
            success: false,
            message: "Veri çekme işlemi başarısız oldu.",
            error: error.message,
            streams: []
        });
    }
}
