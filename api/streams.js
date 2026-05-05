export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        const targetUrl = 'https://kick.com/api/v2/livestreams?tags=KNGL';
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5 saniyede zaman aşımı

        const response = await fetch(proxyUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'
            }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const rawData = await response.json();
            const contents = rawData.contents || rawData;

            if (typeof contents === 'string' && (!contents.trim().startsWith('<!DOCTYPE') && !contents.trim().startsWith('<html'))) {
                const data = JSON.parse(contents);
                const items = data.data || data;

                if (items && items.length > 0) {
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
                }
            }
        }

        // Eğer proxy veya API yanıt vermezse yedek yayıncıları dön
        return res.status(200).json({
            success: true,
            message: "Yedek yayıncılar gösteriliyor.",
            streams: [
                {
                    id: 1,
                    username: "ayberk",
                    category: "Grand Theft Auto V (GTA)",
                    viewers: 1035,
                    thumbnail: "https://picsum.photos/800/450?random=1",
                    avatar: "https://i.pravatar.cc/100?u=ayberk",
                    description: "KNGL RP Canlı Yayını - Ayberk",
                    url: "https://kick.com/ayberk"
                },
                {
                    id: 2,
                    username: "apocalpser",
                    category: "Grand Theft Auto V (GTA)",
                    viewers: 230,
                    thumbnail: "https://picsum.photos/800/450?random=2",
                    avatar: "https://i.pravatar.cc/100?u=apocalpser",
                    description: "KNGL RP Canlı Yayını - Apocalpser",
                    url: "https://kick.com/apocalpser"
                },
                {
                    id: 3,
                    username: "glentiss",
                    category: "Grand Theft Auto V (GTA)",
                    viewers: 62,
                    thumbnail: "https://picsum.photos/800/450?random=3",
                    avatar: "https://i.pravatar.cc/100?u=glentiss",
                    description: "KNGL RP Canlı Yayını - Glentiss",
                    url: "https://kick.com/glentiss"
                }
            ]
        });

    } catch (error) {
        console.error("API Hatası:", error);
        
        // Hata durumunda da sistemin çökmemesi için yedek listeyi dön
        return res.status(200).json({
            success: true,
            message: "Hata oluştu, yedek yayıncılar gösteriliyor.",
            streams: [
                {
                    id: 1,
                    username: "ayberk",
                    category: "Grand Theft Gta V (GTA)",
                    viewers: 1035,
                    thumbnail: "https://picsum.photos/800/450?random=1",
                    avatar: "https://i.pravatar.cc/100?u=ayberk",
                    description: "KNGL RP Canlı Yayını - Ayberk",
                    url: "https://kick.com/ayberk"
                },
                {
                    id: 2,
                    username: "apocalpser",
                    category: "Grand Theft Gta V (GTA)",
                    viewers: 230,
                    thumbnail: "https://picsum.photos/800/450?random=2",
                    avatar: "https://i.pravatar.cc/100?u=apocalpser",
                    description: "KNGL RP Canlı Yayını - Apocalpser",
                    url: "https://kick.com/apocalpser"
                },
                {
                    id: 3,
                    username: "glentiss",
                    category: "Grand Theft Gta V (GTA)",
                    viewers: 62,
                    thumbnail: "https://picsum.photos/800/450?random=3",
                    avatar: "https://i.pravatar.cc/100?u=glentiss",
                    description: "KNGL RP Canlı Yayını - Glentiss",
                    url: "https://kick.com/glentiss"
                }
            ]
        });
    }
}
