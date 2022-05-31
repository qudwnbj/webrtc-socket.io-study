import Head from 'next/head';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuIcon from '@mui/icons-material/Menu';
import VideoCamIcon from '@mui/icons-material/VideoCam';
import VideoCamOffIcon from '@mui/icons-material/VideoCamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import Image from 'next/image';
import WebRTCIcon from 'public/webrtc.svg';
import type { NextPage } from 'next';
import type { SelectChangeEvent } from '@mui/material';

const Home: NextPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>();
  const [audioDeviceList, setAudioDeviceList] = useState<MediaDeviceInfo[]>();
  const [currentCameraLabel, setCurrentCameraLabel] = useState<string>();
  const [currentMicsLabel, setCurrentMicLabel] = useState<string>();
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [stream, setStream] = useState<MediaStream>();
  const [userName, setUserName] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * @see https://developer.mozilla.org/ko/docs/Web/API/MediaDevices
   */
  const getStream = useCallback((constraints: MediaStreamConstraints) => {
    const getMedia = async (constraints: MediaStreamConstraints) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setCurrentCameraLabel(stream.getVideoTracks()[0].label);
        setCurrentMicLabel(stream.getAudioTracks()[0].label);
        if (videoRef.current) {
          setSubmitError(null);
          videoRef.current.srcObject = stream;
          setStream(stream);
        }
      } catch {
        setSubmitError("Can't find user's device");
      }
    };
    getMedia(constraints);
  }, []);

  const onCameraSelectChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      event.preventDefault();
      const videoTarget = videoDeviceList?.find(camera => camera.label === event.target.value);
      const audioTarget = audioDeviceList?.find(mic => mic.label === currentMicsLabel);
      if (!videoTarget || !audioTarget) return;
      getStream({
        video: { deviceId: { exact: videoTarget.deviceId } },
        audio: { deviceId: { exact: audioTarget.deviceId } },
      });
    },
    [getStream, videoDeviceList, audioDeviceList, currentMicsLabel],
  );

  const onMicSelectChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      event.preventDefault();
      const videoTarget = videoDeviceList?.find(camera => camera.label === currentCameraLabel);
      const audioTarget = audioDeviceList?.find(mic => mic.label === event.target.value);
      if (!videoTarget || !audioTarget) return;
      getStream({
        video: { deviceId: { exact: videoTarget.deviceId } },
        audio: { deviceId: { exact: audioTarget.deviceId } },
      });
    },
    [getStream, videoDeviceList, audioDeviceList, currentCameraLabel],
  );

  const handleCameraOn = useCallback(() => {
    setIsCameraOn(prev => {
      if (!stream) return prev;
      stream.getVideoTracks().forEach(camera => (camera.enabled = !prev));
      return !prev;
    });
  }, [stream]);

  const handleMicOn = useCallback(() => {
    setIsMicOn(prev => {
      if (!stream) return prev;
      stream.getAudioTracks().forEach(mic => (mic.enabled = !prev));
      return !prev;
    });
  }, [stream]);

  const onUserNameChange = useCallback<React.FormEventHandler<HTMLInputElement>>(event => {
    setSubmitError(null);
    setUserName(event.currentTarget.value);
  }, []);

  const onRoomNameChange = useCallback<React.FormEventHandler<HTMLInputElement>>(event => {
    setSubmitError(null);
    setRoomName(event.currentTarget.value);
  }, []);

  const onEnterRoomClick = useCallback(() => {
    if (!stream) {
      setSubmitError("Can't find user's device");
      return;
    }
    if (!userName) {
      setSubmitError('Please insert user name');
      return;
    }
    if (!roomName) {
      setSubmitError('Please insert room name');
      return;
    }
  }, [userName, roomName, stream]);

  useEffect(() => {
    const getDevice = async () => {
      /**
       * @see https://developer.mozilla.org/ko/docs/Web/API/MediaDevices/enumerateDevices
       */
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const mics = devices.filter(device => device.kind === 'audioinput');

      setTimeout(() => {
        getStream({ video: true, audio: true });
        setVideoDeviceList(cameras);
        setAudioDeviceList(mics);
      }, 1000);
    };

    getDevice();
  }, [getStream]);

  return (
    <Container sx={{ width: '100vw', height: '100vh' }} disableGutters>
      <Head>
        <title>WebRTC Test</title>
        <meta name="description" content="WebRTC Test" />
        <link rel="icon" href="/webrtc.svg" />
      </Head>
      <AppBar position="static" component="header">
        <Toolbar>
          <Image src={WebRTCIcon} alt="WebRTC Icon" width={24} height={24} />
          <Typography variant="h6" component="div" sx={{ ml: 1, flexGrow: 1 }}>
            WebRTC Test
          </Typography>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container sx={{ pt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography sx={{ mb: 1 }}>Camera</Typography>
                {videoDeviceList && currentCameraLabel ? (
                  <Box>
                    <FormControl fullWidth>
                      <InputLabel id="select-camera-label">Select Camera</InputLabel>
                      <Select
                        labelId="select-camera-label"
                        label="Select Camera"
                        value={currentCameraLabel}
                        onChange={onCameraSelectChange}
                      >
                        {videoDeviceList.map(videoDevice => (
                          <MenuItem key={videoDevice.deviceId} value={videoDevice.label}>
                            {videoDevice.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <CircularProgress sx={{ mb: 1 }} />
                    <Typography>Getting device...</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography sx={{ mb: 1 }}>Mic</Typography>
                {audioDeviceList && currentCameraLabel ? (
                  <Box>
                    <FormControl fullWidth>
                      <InputLabel id="select-mic-label">Select Mic</InputLabel>
                      <Select
                        labelId="select-camera-label"
                        label="Select Mic"
                        value={currentMicsLabel}
                        onChange={onMicSelectChange}
                      >
                        {audioDeviceList.map(audioDevice => (
                          <MenuItem key={audioDevice.deviceId} value={audioDevice.label}>
                            {audioDevice.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <CircularProgress sx={{ mb: 1 }} />
                    <Typography>Getting device...</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography sx={{ mb: 1 }}>Options</Typography>
                <Box sx={{ display: 'flex', alignContent: 'center', justifyContent: 'center' }}>
                  <IconButton color={isCameraOn ? 'primary' : 'error'} onClick={handleCameraOn}>
                    {isCameraOn ? <VideoCamIcon /> : <VideoCamOffIcon />}
                  </IconButton>
                  <IconButton color={isMicOn ? 'primary' : 'error'} onClick={handleMicOn}>
                    {isMicOn ? <MicIcon /> : <MicOffIcon />}
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography sx={{ mb: 1 }}>User</Typography>
                <TextField
                  fullWidth
                  label="User Name"
                  sx={{ mb: 2 }}
                  value={userName}
                  inputProps={{
                    onChange: onUserNameChange,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography sx={{ mb: 1 }}>Preview</Typography>
                {videoDeviceList ? (
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%' }} />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <CircularProgress sx={{ mb: 1 }} />
                    <Typography>Getting device...</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ mb: 1 }}>Room</Typography>
                <TextField
                  fullWidth
                  label="Room Name"
                  sx={{ mb: 2 }}
                  value={roomName}
                  inputProps={{
                    onChange: onRoomNameChange,
                  }}
                />
                {submitError ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <AlertTitle>Error</AlertTitle>
                    {submitError}
                  </Alert>
                ) : null}
                <Button
                  variant="contained"
                  disabled={Boolean(submitError)}
                  onClick={onEnterRoomClick}
                >
                  Enter Room
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
};

export default Home;
