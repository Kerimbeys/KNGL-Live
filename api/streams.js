export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); 

    try {
        const targetUrl = 'https://kick.com/api/v2/livestreams?tags=KNGL';
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(proxyUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return res.status(200).json({
                success: false,
                message: "Proxy yanıt vermedi, sistem aktif.",
                streams: []
            });
        }

        const rawData = await response.json();
        const contents = rawData.contents || rawData;

        if (typeof contents === 'string' && (contents.trim().startsWith('<!DOCTYPE') || contents.trim().startsWith('<html'))) {
            throw new Error('Erişim engellendi.');
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

        return res.status(200).json({ success: true, streams });

    } catch (error) {
        clearTimeout(timeoutId);
        console.error("API Hatası:", error);

        return res.status(200).json({
            success: false,
            message: "Veri çekme işlemi tamamlanamadı ancak uygulama çalışıyor.",
            streams: []
        });
    }
}
