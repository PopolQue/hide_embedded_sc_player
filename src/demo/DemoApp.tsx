import SCPlayer from '../lib/SCPlayer'
import type { Playlist } from '../lib/types'

const playlists: Record<string, Playlist> = {
  '2025': {
    label: 'KUH25',
    playlistId: 'soundcloud:playlists:2158762997',
    url: 'https://soundcloud.com/kleinundhaarig/sets/kuh-2025',
    tracks: [
      { id: 2115495039, title: 'glossy', artist: 'KuH Festival', duration: 10862000, artwork_url: 'https://i1.sndcdn.com/artworks-KHz9AIfQ7JWSeE4T-KUhCyw-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-glossy' },
      { id: 2110295277, title: 'Mark Lando', artist: 'KuH Festival', duration: 10846000, artwork_url: 'https://i1.sndcdn.com/artworks-7NDGyMfFzqKVZT3a-KKwCOA-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-mark-lando' },
      { id: 2238896972, title: 'Sarmabot', artist: 'KuH Festival', duration: 8808000, artwork_url: 'https://i1.sndcdn.com/artworks-HQwRvvByia6bw62z-30xQRg-t1080x1080.png', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-sarmabot' },
      { id: 2242529078, title: 'Aimz', artist: 'KuH Festival', duration: 3924000, artwork_url: 'https://i1.sndcdn.com/artworks-u8FAtfq8hwShfUBG-spyHFg-t1080x1080.png', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-aimz' },
      { id: 2244442814, title: 'DJ Ebhardy', artist: 'KuH Festival', duration: 11741000, artwork_url: 'https://i1.sndcdn.com/artworks-KdwzJIAPbm6Pweg7-rIdSpg-t1080x1080.png', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-dj-ebhardy' },
      { id: 2247265673, title: 'Amelia Holt', artist: 'KuH Festival', duration: 10221000, artwork_url: 'https://i1.sndcdn.com/artworks-YSZkHnpEsdOGYBFM-6yUMOA-t1080x1080.png', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-amelia-holt' },
      { id: 2251310063, title: 'montage & TX4', artist: 'KuH Festival', duration: 14658000, artwork_url: 'https://i1.sndcdn.com/artworks-Zz5CbGLDqpkrMiXH-yzHVUg-t1080x1080.png', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-montage-tx4' },
      { id: 2253715697, title: 'MAENDI', artist: 'KuH Festival', duration: 10672000, artwork_url: 'https://i1.sndcdn.com/artworks-w0lFPmyFNATQVMdS-xf7pAg-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-maendi' },
      { id: 2256991469, title: 'Isolated Material', artist: 'KuH Festival', duration: 10567000, artwork_url: 'https://i1.sndcdn.com/artworks-yEG2Z33FjOWVLRbX-mx9S3Q-t1080x1080.png', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-isolated-material' },
      { id: 2259875003, title: 'Andrea Ida & Philipp Otterbach', artist: 'KuH Festival', duration: 14726000, artwork_url: 'https://i1.sndcdn.com/artworks-Gd6cXFbft0nbZM5X-J95VTA-t1080x1080.png', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-andrea-ida-philipp-otterbach' },
      { id: 2263563560, title: 'jess_whereyouat', artist: 'KuH Festival', duration: 10454000, artwork_url: 'https://i1.sndcdn.com/artworks-GXs2iiLXvSRJI040-5FU8iw-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-jess-whereyouat' },
      { id: 2265809342, title: 'Pomander (Live)', artist: 'KuH Festival', duration: 4318000, artwork_url: 'https://i1.sndcdn.com/artworks-2g18bGPq4HrZMlzo-z8dKyg-t1080x1080.png', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-pomander' },
      { id: 2110536102, title: 'ELISETHERE & BalTribe', artist: 'KuH Festival', duration: 11061000, artwork_url: 'https://i1.sndcdn.com/artworks-0lnMNb0Cmj0yAmND-gJuyzw-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-elise-et-leon' },
      { id: 2110315173, title: 'Yugo', artist: 'KuH Festival', duration: 10016000, artwork_url: 'https://i1.sndcdn.com/artworks-s2nzJnlV5aEZfhQ2-e7CbpA-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-yugo' },
      { id: 2110307094, title: 'Pasci', artist: 'KuH Festival', duration: 8470000, artwork_url: 'https://i1.sndcdn.com/artworks-kaq6YGUhoFOo1lKj-1DIwBQ-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-pasci' },
      { id: 2120577951, title: 'East Moon', artist: 'KuH Festival', duration: 11490000, artwork_url: 'https://i1.sndcdn.com/artworks-uIHCFgyJHycIH8wj-9kOu6w-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-eastmoon' },
      { id: 2119181166, title: 'grossvater', artist: 'KuH Festival', duration: 10511000, artwork_url: 'https://i1.sndcdn.com/artworks-UWHSsqV9JpI2e6Ed-BOIm5w-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-grossvater' },
      { id: 2110269834, title: 'aphasit', artist: 'KuH Festival', duration: 12624000, artwork_url: 'https://i1.sndcdn.com/artworks-Sco5fe4GPSRay9YB-RF8Nmw-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-aphasit' },
      { id: 2110322154, title: 'Gio Elia', artist: 'KuH Festival', duration: 11635000, artwork_url: 'https://i1.sndcdn.com/artworks-4tFzVpG2ukmUvsma-Kb0hmg-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/gio-elia-kuh25' },
      { id: 2115576792, title: 'Firat & Burak', artist: 'KuH Festival', duration: 12448000, artwork_url: 'https://i1.sndcdn.com/artworks-lCowgZAPdW2ho8yl-9AbV0w-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-firat-burak' },
      { id: 2110288770, title: 'Riin', artist: 'KuH Festival', duration: 11635000, artwork_url: 'https://i1.sndcdn.com/artworks-PYWBE8zLPIcu2B9s-l6PhWg-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-riin' },
      { id: 2119371507, title: 'Kanapee Nordwand', artist: 'KuH Festival', duration: 9065000, artwork_url: 'https://i1.sndcdn.com/artworks-ZHkRBfmX4Q84HuB3-eAyosQ-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-kanapee-nordwand' },
      { id: 2118623733, title: 'schnucki47', artist: 'KuH Festival', duration: 10500000, artwork_url: 'https://i1.sndcdn.com/artworks-loyzQPsTMF7FztPT-LSaakw-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2025-schnucki47' },
    ],
  },
  '2024': {
    label: 'KUH24',
    playlistId: 'soundcloud:playlists:1839382410',
    url: 'https://soundcloud.com/kleinundhaarig/sets/kuh2024',
    tracks: [
      { id: 1850441985, title: 'Ada Luvv + Low Key', artist: 'KuH Festival', duration: 10588000, artwork_url: 'https://i1.sndcdn.com/artworks-2v7ytXIlK3cmhMkY-yI6u1Q-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-ada-luvv-low-ki' },
      { id: 1960863663, title: 'Andrea Ida', artist: 'KuH Festival', duration: 4392000, artwork_url: 'https://i1.sndcdn.com/artworks-3FwKNGEo3yqV22MH-X2Pnsg-t1080x1080.png', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-andreaida' },
      { id: 1849889655, title: 'DJ Ebhardy (Live)', artist: 'KuH Festival', duration: 3527000, artwork_url: 'https://i1.sndcdn.com/artworks-BgUCOrCpVGMgeRAz-uJgNxQ-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-dj-ebhardy-live' },
      { id: 1849877574, title: 'FEELX', artist: 'KuH Festival', duration: 6570000, artwork_url: 'https://i1.sndcdn.com/artworks-NyrCD5inZtIrlo5I-hKszcg-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-feelx' },
      { id: 1849882230, title: 'C. Comberti', artist: 'KuH Festival', duration: 7342000, artwork_url: 'https://i1.sndcdn.com/artworks-zxIycyadAw2xAs9Q-HmmQlg-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-c-comberti' },
      { id: 1849896948, title: 'Olgica', artist: 'KuH Festival', duration: 7196000, artwork_url: 'https://i1.sndcdn.com/artworks-jj7fFSqiHCKwbAiC-44UGcg-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-olgica' },
      { id: 1853123916, title: 'Herr Dobler', artist: 'KuH Festival', duration: 8163000, artwork_url: 'https://i1.sndcdn.com/artworks-E6f820v5X8slTyrO-Co38ig-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-herr-dobler' },
      { id: 1850918733, title: 'Sarmabot', artist: 'KuH Festival', duration: 8810000, artwork_url: 'https://i1.sndcdn.com/artworks-IRCuhrZvyuTsaMN1-mWy8uw-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-sarmabot' },
      { id: 1850458515, title: 'Paul Linke', artist: 'KuH Festival', duration: 8810000, artwork_url: 'https://i1.sndcdn.com/artworks-zwnOteozfyxyMooB-YSpi9g-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-paul-linke' },
      { id: 1853109525, title: 'DJ Blech + DJ Gerhardt + Riin', artist: 'KuH Festival', duration: 9428000, artwork_url: 'https://i1.sndcdn.com/artworks-hc9gAxzuBtYMnh1V-CvUZAA-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-blech-gerhardt-riin' },
      { id: 1853127528, title: 'Kanapee Nordwand', artist: 'KuH Festival', duration: 5331000, artwork_url: 'https://i1.sndcdn.com/artworks-iBtlBgFFOhepJ768-PeNC2g-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-kp' },
      { id: 1850447952, title: 'Kessel Vale', artist: 'KuH Festival', duration: 7359000, artwork_url: 'https://i1.sndcdn.com/artworks-XRzdRRD7ZQDxhrkT-5PZUQA-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-kessel-vale' },
      { id: 1853198244, title: 'Filip', artist: 'KuH Festival', duration: 5883000, artwork_url: 'https://i1.sndcdn.com/artworks-6BTi8E6yYhHhHyTJ-aWu6tw-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-filip' },
      { id: 1853088222, title: 'Lohrkraut + Zeitrapha', artist: 'KuH Festival', duration: 14364000, artwork_url: 'https://i1.sndcdn.com/artworks-ShfaAUW3BACQxUh1-RUiKIg-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-lohrkraut-zeitrapha' },
      { id: 1853207016, title: 'N:in', artist: 'KuH Festival', duration: 6896000, artwork_url: 'https://i1.sndcdn.com/artworks-Dy3tkxqIP2WLkuOr-mz2ASg-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-nin' },
      { id: 1853098089, title: 'Dypere', artist: 'KuH Festival', duration: 7614000, artwork_url: 'https://i1.sndcdn.com/artworks-JjPtmDcj0iSezvxK-pgzm6Q-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-dypere' },
      { id: 1853102538, title: 'Esgeem', artist: 'KuH Festival', duration: 7552000, artwork_url: 'https://i1.sndcdn.com/artworks-x478RgiIGtBSyIVp-tY5bCQ-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-esgeem' },
      { id: 1850848134, title: 'Ellice + SAT 70', artist: 'KuH Festival', duration: 7314000, artwork_url: 'https://i1.sndcdn.com/artworks-NhyIBgYKGuocOVTa-uELozA-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-ellice-sat70' },
      { id: 1853730015, title: 'Candy Pollard', artist: 'KuH Festival', duration: 7181000, artwork_url: 'https://i1.sndcdn.com/artworks-6BTi8E6yYhHhHyTJ-aWu6tw-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-candy-pollard' },
      { id: 1850443131, title: 'Jan Loup', artist: 'KuH Festival', duration: 8750000, artwork_url: 'https://i1.sndcdn.com/artworks-mfrwWM1bWoEJzMsU-oF48Aw-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-jan-loup' },
      { id: 1850933517, title: 'tbhase', artist: 'KuH Festival', duration: 8750000, artwork_url: 'https://i1.sndcdn.com/artworks-4WeqmSyVhm3Dx4Gm-6i1QyQ-t1080x1080.jpg', permalink_url: 'https://soundcloud.com/kleinundhaarig/2024-tbhase' },
    ],
  },
}

export default function DemoApp() {
  return (
    <SCPlayer
      playlists={playlists}
      defaultPlaylist="2024"
      scEmbedUrl="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A1839382410&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=true"
      position="bottom"
    />
  )
}
