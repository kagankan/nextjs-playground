"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
// import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
// import { z } from "zod";
import { useDetector } from "../_hooks/useFaceDirection";
import { useRenderPrediction } from "../_hooks/useRenderPrediction";
import { speak } from "../_modules/speech";

interface Keypoint {
  x: number;
  y: number;
  z?: number;
}

interface FaceAngleData {
  angleDeg: number;
  leftEye: Keypoint;
  rightEye: Keypoint;
  nose: Keypoint;
}

const FaceDirectionDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceData, setFaceData] = useState<string>("No data");
  const { detector, pause, resume } = useDetector(videoRef);
  const [currentAngle, setCurrentAngle] = useState<number | null>(null);
  const [leftCalibration, setLeftCalibration] = useState<number>(90 - 30);
  const [rightCalibration, setRightCalibration] = useState<number>(90 + 30);

  // useCamera(videoRef.current);

  useRenderPrediction(detector, videoRef, canvasRef, (keypoints) => {
    // setKeyPoints(keypoints);
    if (keypoints == null) {
      setFaceData("No face detected");
      return;
    } else if (keypoints.length === 0) {
      setFaceData("No face detected");
      return;
    }
    const { angleDeg: faceAngle } = calculateFaceAngle(keypoints ?? []);
    setCurrentAngle(faceAngle);
    const faceDirection = getFaceDirection(faceAngle);

    setFaceData(
      `Face Angle: ${faceAngle.toFixed(0)}°, Direction: ${faceDirection}`
    );
  });

  const INDEX_LEFT_EYE = 33;
  const INDEX_RIGHT_EYE = 263;
  const INDEX_NOSE = 1;

  const calculateFaceAngle = (keypoints: Keypoint[]): FaceAngleData => {
    const leftEye = keypoints[INDEX_LEFT_EYE];
    const rightEye = keypoints[INDEX_RIGHT_EYE];
    const nose = keypoints[INDEX_NOSE];

    const eyesMidpoint = {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y) / 2,
      z: (leftEye.z! + rightEye.z!) / 2,
    };

    const angleRad = Math.atan2(
      nose.y - eyesMidpoint.y,
      nose.x - eyesMidpoint.x
    );
    let angleHorizontalDeg = angleRad * (180 / Math.PI);

    if (angleHorizontalDeg < -180) angleHorizontalDeg += 360;
    if (angleHorizontalDeg > 180) angleHorizontalDeg -= 360;

    // Calculate pitch (up-down rotation)
    const pitchRad = Math.atan2(
      nose.y - eyesMidpoint.y,
      nose.z! - eyesMidpoint.z
    );
    const pitch = pitchRad * (180 / Math.PI);

    return { angleDeg: angleHorizontalDeg, leftEye, rightEye, nose };
  };

  const getFaceDirection = useCallback(
    (angle: number): string => {
      const range = rightCalibration - leftCalibration;
      const percentage = (angle - leftCalibration) / range;
      const percentageClamped = Math.min(1, Math.max(0, percentage));

      const threshold = 0.2;
      if (percentage < threshold) return "Left";
      if (percentage > 1 - threshold) return "Right";
      return "Center";
    },
    [leftCalibration, rightCalibration]
  );

  return (
    <div>
      <h1>Face Direction and Mouth Detection</h1>
      <div style={{ position: "relative", width: "640px", margin: "0 auto" }}>
        <video
          ref={videoRef}
          width={640}
          height={480}
          autoPlay
          muted
          playsInline
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "scaleX(-1)",
          }}
        />
      </div>
      <div style={{ fontSize: "18px", marginTop: "20px" }}>{faceData}</div>
      <button onClick={() => setLeftCalibration(currentAngle || 0)}>
        Calibrate Left
      </button>
      <button onClick={() => setRightCalibration(currentAngle || 0)}>
        Calibrate Right
      </button>

      <button onClick={() => speak("こんにちは")}>はなす</button>

      <button onClick={pause}>Pause</button>
      <button onClick={resume}>Resume</button>
      <div
        style={{ width: "100%", height: "20px", backgroundColor: "lightgray" }}
      >
        <div
          style={{
            width: `${
              currentAngle
                ? ((currentAngle - leftCalibration) /
                    (rightCalibration - leftCalibration)) *
                  100
                : 0
            }%`,
            height: "100%",
            backgroundColor: "green",
          }}
        />
      </div>
    </div>
  );
};

export default FaceDirectionDetector;
