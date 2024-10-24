import { useEffect, useRef, useState } from "react";
import { random_bg_color } from "../helpers/random_bg_color";
import { musicList } from "../helpers/musicList"
import '../App.css'
import '../fa/css/all.min.css';


export const Player = () => {
  const [currTrack] = useState(new Audio(musicList[0].music));
  const [trackIndex, setTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRandom, setIsRandom] = useState<boolean>(false);
  const [nowPlaying, setNowPlaying] = useState<string>('');
  const [seekPosition, setSeekPosition] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>("0:0");
  const [totalDuration, setTotalDuration] = useState("0:0");

  const updateTimer = useRef<undefined | number>(undefined);
  const seekSliderRef = useRef<null>(null);

  useEffect(() => {
    loadTrack(trackIndex);

    const updateInterval = setInterval(setUpdate, 100);

    return () => {
      currTrack.pause();
      clearInterval(updateTimer.current);
      clearInterval(updateInterval);
    };
  }, [trackIndex]);

  const loadTrack = (index: number) => {

    currTrack.src = musicList[index].music;
    currTrack.load();

    // Esperar a que el archivo de audio esté listo para reproducirse
    currTrack.addEventListener('canplay', () => {
      if (isPlaying) {
        playTrack();  // Reproduce automáticamente cuando esté listo
      } else {
        setIsPlaying(false)
      }
    });

    setNowPlaying(`Reproduciendo ${index + 1} de ${musicList.length}`);

    random_bg_color()
  };

  const playTrack = () => {
    if (currTrack) {
      currTrack.play()
        .then(() => {
          setIsPlaying(true);
          // Establecer el temporizador de actualización
          updateTimer.current = setInterval(setUpdate, 100);
        })
        .catch(() => {
          // console.error("Error al reproducir la pista:", error);

        });
    }
  };

  const pauseTrack = () => {
    if (currTrack) {
      currTrack.pause();
      setIsPlaying(false);
      clearInterval(updateTimer.current); // Limpiar el temporizador al pausar
    }
  };

  const playpauseTrack = () => isPlaying ? pauseTrack() : playTrack();

  const nextTrack = () => {
    setTrackIndex((prevIndex) => {
      let newIndex;

      if (isRandom) {

        newIndex = Math.floor(Math.random() * musicList.length);

        while (newIndex === prevIndex && musicList.length > 1) {
          newIndex = Math.floor(Math.random() * musicList.length);
        }
      } else {

        newIndex = prevIndex < musicList.length - 1 ? prevIndex + 1 : 0;
      }

      loadTrack(newIndex);
      if (isPlaying) {
        playTrack();
      }

      return newIndex;
    });
  };

  const prevTrack = () => {
    setTrackIndex((prevIndex) => {
      const newIndex = prevIndex > 0 ? prevIndex - 1 : musicList.length - 1;
      loadTrack(newIndex);
      playTrack();
      return newIndex;
    });
  };

  const seekTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = currTrack.duration * (parseInt(e.currentTarget.value) / 100)
    currTrack.currentTime = seekTo;
  };

  const setVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    currTrack.volume = (parseInt(e.currentTarget.value) / 100)
  };

  const setUpdate = () => {
    let seekPosition = 0;

    if (!isNaN(currTrack.duration)) {
      seekPosition = currTrack.currentTime * (100 / currTrack.duration);
      setSeekPosition(seekPosition); // Actualiza el valor del slider

      // Calcular el tiempo actual y la duración total
      let currentMinutes = Math.floor(currTrack.currentTime / 60);
      let currentSeconds = Math.floor(currTrack.currentTime - currentMinutes * 60);
      let durationMinutes = Math.floor(currTrack.duration / 60);
      let durationSeconds = Math.floor(currTrack.duration - durationMinutes * 60);

      // Asegurar que los segundos y minutos estén formateados correctamente
      if (currentSeconds < 10) { currentSeconds = parseInt("0") + currentSeconds; }
      if (durationSeconds < 10) { durationSeconds = parseInt("0") + durationSeconds; }
      if (currentMinutes < 10) { currentMinutes = parseInt("0") + currentMinutes; }
      if (durationMinutes < 10) { durationMinutes = parseInt("0") + durationMinutes; }


      // Actualizar los estados de tiempo
      setCurrentTime(currentMinutes + ":" + currentSeconds);
      setTotalDuration(durationMinutes + ":" + durationSeconds);
    }
  };


  return (

    <>
      <div className="player">
        <div className=" wrapper">
          {/* Sidebar con la lista de canciones */}
          <div className="sidebar" id="sidebar">
            <ul id="song-list">
              {musicList.map((song, index) => (
                <li key={index} onClick={() => setTrackIndex(index)}>
                  {song.game} - {song.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Detalles de la pista actual */}
          <div className="details">
            <h2 className="font-bold text-stone-800 bg-stone-200 px-5 py-3 rounded-xl">{nowPlaying}</h2>
            <span
              className={`track-art ${isPlaying ? 'rotate' : ''}`}
              style={{ backgroundImage: `url(${musicList[trackIndex].img})` }}
            ></span>

            <span className="track-name">{musicList[trackIndex].name}</span>
            <span className="track-game">{musicList[trackIndex].game}</span>
          </div>

          {/* Control del progreso de la canción */}
          <div className="slider_container">
            <span className="current-time text-slate-600">{currentTime}</span>
            <input
              type="range"
              min="1"
              max="100"
              value={seekPosition}
              ref={seekSliderRef}
              className="seek_slider w-full mx-2 rounded-xl"
              onChange={seekTo}
            />
            <span className="total-duration text-slate-600">{totalDuration}</span>
          </div>

          {/* Control de volumen */}
          <div className="slider_container">
            <i className="fa fa-volume-down"></i>
            <input
              type="range"
              min="1"
              max="100"
              defaultValue="99"
              className="volume_slider"
              onChange={setVolume}
            />
            <i className="fa fa-volume-up"></i>
          </div>

          {/* Botones de control de reproducción */}
          <div className="buttons bg-stone-300 rounded-xl">
            <div className="random-track" onClick={() => setIsRandom(!isRandom)}>
              <i className={`fas fa-random ${isRandom ? 'randomActive' : ''} t`} title="random"></i>
            </div>
            <div className="prev-track" onClick={prevTrack}>
              <i className="fa fa-step-backward t"></i>
            </div>
            <div className="playpause-track" onClick={playpauseTrack}>
              <i className={`fa ${isPlaying ? 'fa-pause-circle' : 'fa-play-circle'} f`}></i>
            </div>
            <div className="next-track" onClick={nextTrack}>
              <i className="fa fa-step-forward t"></i>
            </div>
            <div className="repeat-track" onClick={() => loadTrack(trackIndex)}>
              <i className="fa fa-repeat t" title="repeat"></i>
            </div>
          </div>

          <hr className=""/>
          <footer className=" mt-3 text-center text-sm font-extralight">Developed by Tonof</footer>

        </div>
      </div>
    </>

  );
}
