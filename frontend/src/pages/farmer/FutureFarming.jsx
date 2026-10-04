import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Bot, Droplets, Film, Leaf, Play, Satellite, Sprout, Tractor, Volume2, VolumeX, Wifi } from "lucide-react";
import "./FutureFarming.css";

const videos = [
  {
    title: "Smart Tractor",
    duration: "45 sec",
    icon: Tractor,
    description: "See autonomous tractors prepare fields, plant crops, and support harvesting.",
    poster: "https://archive.org/services/img/autonomous-8-r-tractor-john-deere-precision-ag",
    video: {
      src: "https://archive.org/download/autonomous-8-r-tractor-john-deere-precision-ag/Autonomous%208R%20Tractor%20_%20John%20Deere%20Precision%20Ag.mp4",
      title: "Autonomous 8R Tractor | John Deere Precision Ag",
      source: "John Deere · Internet Archive",
      captions: [
        "Satellite guidance helps the tractor work accurately.",
        "Autonomous systems support field operations.",
        "The farmer stays in control of the work.",
      ],
    },
    accent: "forest",
  },
  {
    title: "AI Drone Farming",
    duration: "45 sec",
    icon: Satellite,
    description: "Explore how drones survey crops and help identify disease, pests, and water stress.",
    poster: "https://archive.org/services/img/4kfreestockfootageaerealdronevideoagriculturefieldmariojrmatos",
    video: {
      src: "/drone-spraying.mp4",
      title: "Drone spraying in action",
      source: "Krishi Mitra project video",
      captions: [
        "A drone surveys the crops from above.",
        "Targeted spraying supports precise crop care.",
        "Technology helps farmers monitor their fields.",
      ],
    },
    accent: "blue",
  },
  {
    title: "Smart Irrigation",
    duration: "40 sec",
    icon: Droplets,
    description: "Follow soil sensors as they signal irrigation when crops need water.",
    poster: "https://archive.org/services/img/cowomn-Water_Efficiency_-_Smart_Irrigation",
    video: {
      src: "https://archive.org/download/cowomn-Water_Efficiency_-_Smart_Irrigation/Water_Efficiency_-_Smart_Irrigation.mp4",
      title: "Water Efficiency - Smart Irrigation",
      source: "Water efficiency example · Internet Archive",
      captions: [
        "Smart irrigation helps use water efficiently.",
        "Sensors guide when crops need watering.",
        "Water reaches plants when it is needed.",
      ],
    },
    accent: "water",
  },
  {
    title: "Farm Robots",
    duration: "50 sec",
    icon: Bot,
    description: "Discover robots designed to help with weeding, crop care, and harvesting.",
    poster: "https://archive.org/services/img/youtube-vFIGo-XJ7Yc",
    video: {
      src: "https://archive.org/download/youtube-vFIGo-XJ7Yc/vFIGo-XJ7Yc.mp4",
      title: "This farming robot does all the work for you",
      source: "Farming robot example · Internet Archive",
      captions: [
        "Robots can assist with repetitive farm work.",
        "Automated tools help care for crops.",
        "Farmers guide the technology in their fields.",
      ],
    },
    accent: "gold",
  },
  {
    title: "Agriculture 2035+",
    duration: "1–2 min",
    icon: Sprout,
    description: "Imagine connected farms bringing AI, satellites, renewable energy, and livestock monitoring together.",
    poster: "https://archive.org/services/img/ttvwi-The_Future_of_Agriculture_is_Here",
    video: {
      src: "https://archive.org/download/ttvwi-The_Future_of_Agriculture_is_Here/The_Future_of_Agriculture_is_Here.mp4",
      title: "The Future of Agriculture is Here",
      source: "Future agriculture example · Internet Archive",
      captions: [
        "Connected technology brings farm information together.",
        "Data can support timely farming decisions.",
        "The farmer remains at the heart of the future.",
      ],
    },
    accent: "sun",
  },
];

const storyScenes = [
  { title: "Today", description: "Farmers balance manual work with changing weather and uncertain conditions.", icon: Sprout },
  { title: "Connected farm", description: "IoT sensors collect soil and weather data for a mobile dashboard.", icon: Wifi },
  { title: "AI farming", description: "AI combines crop, soil, and weather information to support decisions.", icon: Bot },
  { title: "Drone monitoring", description: "Aerial surveys help spot crop stress, pests, and possible disease.", icon: Satellite },
  { title: "Autonomous machines", description: "Smart machines support planting, weeding, and harvesting.", icon: Tractor },
  { title: "Smart irrigation", description: "Soil moisture readings help start and stop watering when needed.", icon: Droplets },
  { title: "Future farm", description: "Solar power, greenhouses, robots, drones, satellite data, and livestock monitoring work together.", icon: Leaf },
  { title: "Krishi Mitra", description: "From Traditional Farming to Intelligent Farming.", icon: Film },
];

const roadmap = [
  {
    year: "2026",
    title: "Smart monitoring",
    detail: "IoT, weather, soil sensors, and a connected mobile app.",
    video: {
      src: "https://archive.org/download/youtube-2A8WKTXoUxA/American_Tech-IOT_Smart_Robot_for_the_farming_My_school_project-2A8WKTXoUxA.mp4",
      title: "IoT Smart Robot for the farming",
      source: "IoT farming project · Internet Archive",
      captions: [
        "Connected devices bring farm data together.",
        "Sensors can help monitor growing conditions.",
        "A mobile view keeps farm insights close.",
      ],
    },
  },
  {
    year: "2027–2028",
    title: "AI agriculture",
    detail: "Disease detection, crop prediction, and decision support.",
    video: {
      src: "/drone-spraying.mp4",
      title: "Drone crop monitoring example",
      source: "Krishi Mitra project video",
      captions: [
        "Aerial views help monitor crop conditions.",
        "Farmers can inspect fields more efficiently.",
        "Technology supports informed crop care.",
      ],
    },
  },
  {
    year: "2028–2030",
    title: "Automated farming",
    detail: "Drones, autonomous tractors, and robotic operations.",
    video: {
      src: "https://archive.org/download/autonomous-8-r-tractor-john-deere-precision-ag/Autonomous%208R%20Tractor%20_%20John%20Deere%20Precision%20Ag.mp4",
      title: "Autonomous 8R Tractor | John Deere Precision Ag",
      source: "John Deere video · Internet Archive",
      captions: [
        "Autonomous tractors can support field work.",
        "Guidance technology helps machines follow a route.",
        "Farmers oversee automated operations.",
      ],
    },
  },
  {
    year: "2030–2035",
    title: "Connected farms",
    detail: "AI, 5G, satellite data, digital twins, and autonomous systems.",
    video: {
      src: "https://archive.org/download/4kfreestockfootageaerealdronevideoagriculturefieldmariojrmatos/4k%20free%20stock%20footage%20aereal%20drone%20video%20agriculture%20field%20mariojrmatos.mp4",
      title: "Aerial agricultural field footage",
      source: "Mário J.R. Matos · CC BY 4.0",
      captions: [
        "Aerial imagery offers a new view of fields.",
        "Farmers can survey crops from above.",
        "Better visibility can help plan field work.",
      ],
    },
  },
  {
    year: "2035+",
    title: "Intelligent agriculture",
    detail: "Coordinated crops, irrigation, machinery, livestock, storage, and supply chains—with the farmer in control.",
    video: {
      src: "https://archive.org/download/ttvwi-The_Future_of_Agriculture_is_Here/The_Future_of_Agriculture_is_Here.mp4",
      title: "The Future of Agriculture is Here",
      source: "Internet Archive example",
      captions: [
        "Connected tools can support modern agriculture.",
        "Sensors, data, and automation work together.",
        "Farmers remain in control of the future.",
      ],
    },
  },
];

function FutureVideoPlayer({ video, poster, className, label }) {
  const videoRef = useRef(null);
  const activeCueRef = useRef(-1);
  const [activeCue, setActiveCue] = useState(-1);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [narrationEnabled, setNarrationEnabled] = useState(true);
  const narrationAvailable = typeof window !== "undefined" && "speechSynthesis" in window;

  const speakCue = (index) => {
    if (!narrationEnabled || !narrationAvailable || index < 0) return;
    window.speechSynthesis.cancel();
    const narration = new SpeechSynthesisUtterance(video.captions[index]);
    narration.lang = "en-US";
    narration.rate = 1;
    narration.pitch = 1;
    narration.onstart = () => {
      if (videoRef.current && !videoRef.current.paused) videoRef.current.muted = true;
    };
    narration.onend = () => {
      if (videoRef.current && !videoRef.current.paused) videoRef.current.muted = false;
    };
    window.speechSynthesis.speak(narration);
  };

  const syncCaption = () => {
    const player = videoRef.current;
    if (!player || !video.captions.length) return;
    const progress = player.duration > 0 ? player.currentTime / player.duration : 0;
    const nextCue = Math.min(video.captions.length - 1, Math.floor(progress * video.captions.length));
    if (nextCue === activeCueRef.current) return;
    activeCueRef.current = nextCue;
    setActiveCue(nextCue);
    if (!player.paused) speakCue(nextCue);
  };

  const stopNarration = () => {
    if (narrationAvailable) window.speechSynthesis.cancel();
    if (videoRef.current) videoRef.current.muted = false;
  };

  useEffect(() => () => {
    if (narrationAvailable) window.speechSynthesis.cancel();
  }, [narrationAvailable]);

  const toggleNarration = () => {
    if (narrationEnabled) {
      setNarrationEnabled(false);
      stopNarration();
      return;
    }
    setNarrationEnabled(true);
    if (videoRef.current && !videoRef.current.paused) speakCue(Math.max(0, activeCueRef.current));
  };

  const handlePlay = () => {
    if (activeCueRef.current < 0) syncCaption();
    else speakCue(activeCueRef.current);
  };

  return (
    <div className={`${className} km-future__player-shell`}>
      <video
        ref={videoRef}
        className="km-future__native-player"
        controls
        preload="none"
        playsInline
        poster={poster}
        aria-label={video.title}
        onPlay={handlePlay}
        onTimeUpdate={syncCaption}
        onPause={stopNarration}
        onEnded={() => {
          stopNarration();
          activeCueRef.current = -1;
          setActiveCue(-1);
        }}
        onSeeking={syncCaption}
      >
        <source src={video.src} type="video/mp4" />
        Your browser does not support this video.
      </video>
      <div className="km-future__brand-watermark" aria-label="Krishi Mitra">
        <img src="/krishi-mitra-mark.svg" alt="" />
        <span>KRISHI MITRA</span>
      </div>
      <div className="km-future__video-tools">
        <button
          type="button"
          className={captionsEnabled ? "is-enabled" : ""}
          aria-pressed={captionsEnabled}
          onClick={() => setCaptionsEnabled((enabled) => !enabled)}
          title={captionsEnabled ? "Turn English subtitles off" : "Turn English subtitles on"}
        >
          CC
        </button>
        <button
          type="button"
          className={narrationEnabled ? "is-enabled" : ""}
          aria-pressed={narrationEnabled}
          disabled={!narrationAvailable}
          onClick={toggleNarration}
          title={narrationAvailable ? (narrationEnabled ? "Turn English narration off" : "Turn English narration on") : "English narration is not supported in this browser"}
          aria-label={narrationEnabled ? "Turn English narration off" : "Turn English narration on"}
        >
          {narrationEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
      </div>
      {captionsEnabled && activeCue >= 0 && (
        <div className="km-future__subtitle" aria-live="polite" aria-atomic="true">
          {video.captions[activeCue]}
        </div>
      )}
      <span className="km-future__sr-only">{label}</span>
    </div>
  );
}

export default function FutureFarming() {
  return (
    <div className="km-future">
      <header className="km-future__hero">
        <div className="km-future__hero-copy">
          <span className="km-future__eyebrow"><Film size={15} /> KRISHI MITRA • AGRICULTURE 4.0</span>
          <h1>WATCH THE FUTURE OF FARMING</h1>
          <p>Five short video stories imagining practical technology that can help farmers work smarter, conserve resources, and make informed decisions.</p>
          <a className="km-future__hero-link" href="#future-videos">
            Explore the videos <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="km-future__hero-mark" aria-hidden="true">
          <Sprout size={86} strokeWidth={1.2} />
          <span>Farm smarter<br />grow together</span>
        </div>
      </header>

      <section id="future-videos" className="km-future__section" aria-labelledby="future-videos-title">
        <div className="km-future__section-heading">
          <div>
            <span className="km-future__eyebrow">FIVE SHORT STORIES</span>
            <h2 id="future-videos-title">Technology in the field</h2>
          </div>
          <span className="km-future__count">5 videos</span>
        </div>
        <p className="km-future__section-intro">
          Play each video here. Durations shown are suggested runtimes for these stories; example video lengths may vary.
        </p>
        <div className="km-future__videos">
          {videos.map(({ title, duration, icon: Icon, description, video, poster, accent }) => (
            <article className={`km-future__video km-future__video--${accent}`} key={title}>
              <div className="km-future__video-player-wrap">
                <FutureVideoPlayer className="km-future__video-player" video={video} poster={poster} label={`${title} video player`} />
                <span className="km-future__duration"><Film size={13} /> {duration}</span>
              </div>
              <div className="km-future__video-copy">
                <h3><Icon size={18} aria-hidden="true" /> {title}</h3>
                <span className="km-future__video-source">{video.source}</span>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="km-future__story" aria-labelledby="future-story-title">
        <div className="km-future__section-heading">
          <div>
            <span className="km-future__eyebrow">THE MAIN FUTURE VIDEO</span>
            <h2 id="future-story-title">From today’s farm to the farm of tomorrow</h2>
          </div>
        </div>
        <p className="km-future__section-intro">An eight-scene story: technology supports farmers at every step, while people remain in control.</p>
        <ol className="km-future__scenes">
          {storyScenes.map(({ title, description, icon: Icon }, index) => (
            <li className="km-future__scene" key={title}>
              <span className="km-future__scene-number">{String(index + 1).padStart(2, "0")}</span>
              <Icon className="km-future__scene-icon" size={21} />
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
        <blockquote className="km-future__quote">
          <span>“From Traditional Farming to Intelligent Farming.”</span>
          <cite>Krishi Mitra — Technology for Every Farmer.</cite>
        </blockquote>
      </section>

      <section className="km-future__roadmap" aria-labelledby="future-roadmap-title">
        <div className="km-future__section-heading">
          <div>
            <span className="km-future__eyebrow">A VISION, NOT A DELIVERY PROMISE</span>
            <h2 id="future-roadmap-title">Future agriculture roadmap</h2>
          </div>
        </div>
        <div className="km-future__milestones">
          {roadmap.map((milestone) => (
            <article className="km-future__milestone" key={milestone.year}>
              <span>{milestone.year}</span>
              <h3>{milestone.title}</h3>
              <p>{milestone.detail}</p>
              <div className="km-future__milestone-example">
                <span className="km-future__example-label"><Play size={12} fill="currentColor" /> Video example</span>
                <FutureVideoPlayer className="km-future__example-player" video={milestone.video} label={`${milestone.year} roadmap video player`} />
                <span className="km-future__example-source">{milestone.video.source}</span>
              </div>
            </article>
          ))}
        </div>
        <p className="km-future__note">
          This roadmap presents a future-facing vision. Technologies and timelines are illustrative; adoption depends on research, infrastructure, affordability, and farmers’ needs.
        </p>
      </section>
    </div>
  );
}
