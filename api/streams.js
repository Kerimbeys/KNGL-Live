export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 saniye zaman aşımı

    try {
        const targetUrl = 'https://kick.com/api/v2/livestreams?tags=KNGL';
        
        // Proxy alternatifleri ve tipleri
        const proxies = [
            {
                url: `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
                type: 'allorigins'
            },
            {
                url: `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
                type: 'corsproxy'
            }
        ];

        let response;
        let success = false;
        let usedProxyType = '';

        // Proxy servislerini sırayla dener
        for (let p of proxies) {
            try {
                response = await fetch(p.url, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'
                    }
                });

                if (response.ok) {
                    success = true;
                    usedProxyType = p.type;
                    break;
                }
            } catch (err) {
                console.error(`${p.type} isteği sırasında hata oluştu:`, err);
            }
        }

        clearTimeout(timeoutId);

        if (!success || !response) {
            throw new Error('Tüm proxy servisleri zaman aşımına uğradı veya başarısız oldu.');
        }

        const rawData = await response.json();
        
        let contents;
        if (usedProxyType === 'allorigins') {
            contents = rawData.contents;
        } else {
            contents = rawData; // corsproxy.io doğrudan yanıtı döner
        }

        // Eğer dönen içerik HTML ise (engellendiysek) hata fırlat
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
        clearTimeout(timeoutId);
        console.error("API Veri Çekme Hatası:", error);

        res.status(500).json({
            success: false,
            message: "Veri çekme işlemi başarısız oldu.",
            error: error.message,
            streams: []
        });
    }
}
