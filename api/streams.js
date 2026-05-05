export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        const targetUrl = 'https://kick.com/api/v2/livestreams?tags=KNGL';
        
        // Alternatif proxy servisleri
        const proxies = [
            `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
        ];

        let response;
        let success = false;

        // Proxy alternatiflerini sırayla dener
        for (let i = 0; i < proxies.length; i++) {
            try {
                response = await fetch(proxies[i], {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
                    }
                });

                if (response.ok) {
                    success = true;
                    break;
                }
            } catch (err) {
                console.error(`Proxy ${i} hatası:`, err);
            }
        }

        if (!success || !response) {
            throw new Error('Tüm proxy servisleri başarısız oldu.');
        }

        const rawData = await response.json();
        let contents = rawData.contents || rawData;

        // Eğer dönen veri HTML ise (engellendiysek) hata fırlat
        if (typeof contents === 'string' && (contents.trim().startsWith('<!DOCTYPE') || contents.trim().startsWith('<html'))) {
            throw new Error('Kick API erişimi engellendi veya sunucu hata sayfasına yönlendirdi.');
        }

        const data = typeof contents === 'string' ? JSON.parse(contents) : contents;
        const items = data.data || data;

        if (!items || items.length === 0) {
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

        res.status(500).json({
            success: false,
            message: "Veri çekme işlemi başarısız oldu.",
            error: error.message,
            streams: []
        });
    }
}
