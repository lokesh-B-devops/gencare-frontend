import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Float, Text, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Cute Baby in Bear Hoodie
const CuteBabyRobot = () => {
    const group = useRef();

    // Animate the baby
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
            // Gentle floating/breathing animation
            group.current.position.y = Math.sin(t) * 0.05;
            group.current.rotation.y = Math.sin(t / 2) * 0.05;
        }
    });

    // Materials
    const skinMaterial = new THREE.MeshStandardMaterial({ color: "#FFE0BD", roughness: 0.4, metalness: 0.1 }); // Softer skin tone
    const onesieMaterial = new THREE.MeshStandardMaterial({ color: "#FDFBF7", roughness: 0.6, metalness: 0.0 }); // Cream/White fleece
    const innerEarMaterial = new THREE.MeshStandardMaterial({ color: "#FFD1DC", roughness: 0.5 }); // Pink inner ear
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ color: "white", roughness: 0.1 });
    const eyeBlueMaterial = new THREE.MeshStandardMaterial({ color: "#3B82F6", roughness: 0.1 });
    const eyeBlackMaterial = new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.1 });
    const hairMaterial = new THREE.MeshStandardMaterial({ color: "#8D5524", roughness: 0.8 });

    return (
        <group ref={group}>
            {/* --- HOOD & HEAD --- */}
            <group position={[0, 1.2, 0]}>
                {/* Hood (Outer Shell) */}
                <mesh position={[0, 0, -0.1]}>
                    <sphereGeometry args={[0.95, 64, 64]} />
                    <primitive object={onesieMaterial} />
                </mesh>

                {/* Face Masking (The hole in the hood) relies on positioning the face slightly forward */}

                {/* Face */}
                <mesh position={[0, -0.05, 0.25]} scale={[0.85, 0.85, 0.85]}>
                    <sphereGeometry args={[0.9, 64, 64]} />
                    <primitive object={skinMaterial} />
                </mesh>

                {/* Hair Wisps (Peeking out) */}
                <group position={[0, 0.65, 0.9]}>
                    <mesh rotation={[0.2, 0, 0]}>
                        <sphereGeometry args={[0.2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <primitive object={hairMaterial} />
                    </mesh>
                </group>

                {/* Bear Ears on Hood */}
                {/* Left Ear */}
                <group position={[-0.7, 0.7, 0.1]} rotation={[0, 0, -0.6]}>
                    <mesh>
                        <sphereGeometry args={[0.25, 32, 32]} />
                        <primitive object={onesieMaterial} />
                    </mesh>
                    <mesh position={[0, 0, 0.18]} scale={[0.8, 0.8, 0.2]}>
                        <sphereGeometry args={[0.2, 32, 32]} />
                        <primitive object={innerEarMaterial} />
                    </mesh>
                </group>

                {/* Right Ear */}
                <group position={[0.7, 0.7, 0.1]} rotation={[0, 0, 0.6]}>
                    <mesh>
                        <sphereGeometry args={[0.25, 32, 32]} />
                        <primitive object={onesieMaterial} />
                    </mesh>
                    <mesh position={[0, 0, 0.18]} scale={[0.8, 0.8, 0.2]}>
                        <sphereGeometry args={[0.2, 32, 32]} />
                        <primitive object={innerEarMaterial} />
                    </mesh>
                </group>

                {/* Eyes */}
                <group position={[0, 0, 1.05]}>
                    {/* Left Eye */}
                    <group position={[-0.28, 0, 0]}>
                        <mesh scale={[1, 1.1, 0.3]}>
                            <sphereGeometry args={[0.18, 32, 32]} />
                            <primitive object={eyeWhiteMaterial} />
                        </mesh>
                        <mesh position={[0, 0, 0.1]} scale={[1, 1.1, 0.2]}>
                            <sphereGeometry args={[0.11, 32, 32]} />
                            <primitive object={eyeBlueMaterial} />
                        </mesh>
                        <mesh position={[0, 0, 0.14]} scale={[1, 1.1, 0.2]}>
                            <sphereGeometry args={[0.06, 32, 32]} />
                            <primitive object={eyeBlackMaterial} />
                        </mesh>
                        {/* Shine */}
                        <mesh position={[0.06, 0.06, 0.16]}>
                            <sphereGeometry args={[0.04, 16, 16]} />
                            <primitive object={eyeWhiteMaterial} />
                        </mesh>
                    </group>

                    {/* Right Eye */}
                    <group position={[0.28, 0, 0]}>
                        <mesh scale={[1, 1.1, 0.3]}>
                            <sphereGeometry args={[0.18, 32, 32]} />
                            <primitive object={eyeWhiteMaterial} />
                        </mesh>
                        <mesh position={[0, 0, 0.1]} scale={[1, 1.1, 0.2]}>
                            <sphereGeometry args={[0.11, 32, 32]} />
                            <primitive object={eyeBlueMaterial} />
                        </mesh>
                        <mesh position={[0, 0, 0.14]} scale={[1, 1.1, 0.2]}>
                            <sphereGeometry args={[0.06, 32, 32]} />
                            <primitive object={eyeBlackMaterial} />
                        </mesh>
                        {/* Shine */}
                        <mesh position={[0.06, 0.06, 0.16]}>
                            <sphereGeometry args={[0.04, 16, 16]} />
                            <primitive object={eyeWhiteMaterial} />
                        </mesh>
                    </group>
                </group>

                {/* Cheeks */}
                <mesh position={[-0.45, -0.2, 0.95]} scale={[1, 0.6, 1]}>
                    <sphereGeometry args={[0.15, 32, 32]} />
                    <meshStandardMaterial color="#FF69B4" opacity={0.3} transparent />
                </mesh>
                <mesh position={[0.45, -0.2, 0.95]} scale={[1, 0.6, 1]}>
                    <sphereGeometry args={[0.15, 32, 32]} />
                    <meshStandardMaterial color="#FF69B4" opacity={0.3} transparent />
                </mesh>

                {/* Nose */}
                <mesh position={[0, -0.15, 1.08]}>
                    <sphereGeometry args={[0.04, 32, 32]} />
                    <meshStandardMaterial color="#FFC1CC" />
                </mesh>

                {/* Mouth */}
                <mesh position={[0, -0.3, 1.05]} rotation={[0, 0, Math.PI]}>
                    <torusGeometry args={[0.08, 0.02, 16, 32, Math.PI]} />
                    <meshStandardMaterial color="#D68692" />
                </mesh>
            </group>


            {/* --- BODY (Sitting Pose) --- */}
            <group position={[0, 0, 0]}>
                {/* Main Torso */}
                <mesh position={[0, -0.2, -0.1]} scale={[1, 1.1, 0.9]}>
                    <sphereGeometry args={[0.8, 32, 32]} />
                    <primitive object={onesieMaterial} />
                </mesh>

                {/* Zipper/Buttons detail */}
                <mesh position={[0, -0.2, 0.75]}>
                    <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
                    <meshStandardMaterial color="#eee" />
                </mesh>

                {/* Legs (Sitting forward) */}
                {/* Left Leg */}
                <group position={[-0.5, -0.6, 0.4]} rotation={[-0.5, -0.3, 0]}>
                    <mesh>
                        <capsuleGeometry args={[0.22, 0.6, 4, 8]} />
                        <primitive object={onesieMaterial} />
                    </mesh>
                    {/* Foot */}
                    <group position={[0, -0.4, 0.2]} rotation={[1.2, 0, 0]}>
                        <mesh scale={[1, 1, 1.5]}>
                            <sphereGeometry args={[0.2, 32, 32]} />
                            <primitive object={onesieMaterial} />
                        </mesh>
                        {/* Feet bottoms */}
                        <mesh position={[0, 0.05, 0.25]} rotation={[-0.2, 0, 0]} scale={[0.8, 1, 0.1]}>
                            <sphereGeometry args={[0.15, 32, 32]} />
                            <primitive object={skinMaterial} />
                        </mesh>
                        {/* Toes */}
                        <mesh position={[0, 0.22, 0.2]} scale={[1, 0.5, 0.5]}>
                            <sphereGeometry args={[0.05, 16, 16]} />
                            <primitive object={skinMaterial} />
                        </mesh>
                    </group>
                </group>

                {/* Right Leg */}
                <group position={[0.5, -0.6, 0.4]} rotation={[-0.5, 0.3, 0]}>
                    <mesh>
                        <capsuleGeometry args={[0.22, 0.6, 4, 8]} />
                        <primitive object={onesieMaterial} />
                    </mesh>
                    {/* Foot */}
                    <group position={[0, -0.4, 0.2]} rotation={[1.2, 0, 0]}>
                        <mesh scale={[1, 1, 1.5]}>
                            <sphereGeometry args={[0.2, 32, 32]} />
                            <primitive object={onesieMaterial} />
                        </mesh>
                        {/* Feet bottoms */}
                        <mesh position={[0, 0.05, 0.25]} rotation={[-0.2, 0, 0]} scale={[0.8, 1, 0.1]}>
                            <sphereGeometry args={[0.15, 32, 32]} />
                            <primitive object={skinMaterial} />
                        </mesh>
                    </group>
                </group>

                {/* Arms (Resting) */}
                {/* Left Arm */}
                <group position={[-0.75, 0.2, 0.1]} rotation={[0, 0, -0.3]}>
                    <mesh position={[0, -0.3, 0]}>
                        <capsuleGeometry args={[0.18, 0.7, 4, 8]} />
                        <primitive object={onesieMaterial} />
                    </mesh>
                    <mesh position={[0, -0.7, 0.1]}>
                        <sphereGeometry args={[0.18, 32, 32]} />
                        <primitive object={skinMaterial} />
                    </mesh>
                </group>

                {/* Right Arm */}
                <group position={[0.75, 0.2, 0.1]} rotation={[0, 0, 0.3]}>
                    <mesh position={[0, -0.3, 0]}>
                        <capsuleGeometry args={[0.18, 0.7, 4, 8]} />
                        <primitive object={onesieMaterial} />
                    </mesh>
                    <mesh position={[0, -0.7, 0.1]}>
                        <sphereGeometry args={[0.18, 32, 32]} />
                        <primitive object={skinMaterial} />
                    </mesh>
                </group>

            </group>

            {/* Text Bubble */}
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
                <group position={[0, 2.8, 0]}>
                    <Text
                        fontSize={0.4}
                        color="#FF4081"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.02}
                        outlineColor="#ffffff"
                    >
                        Welcome Mommy!
                    </Text>
                </group>
            </Float>

        </group>
    );
};

const AiBaby3D = ({ onComplete }) => {
    const [swirl, setSwirl] = useState(true);

    useEffect(() => {
        // Speak Welcome Message
        const speak = () => {
            const msg = new SpeechSynthesisUtterance("Hi Mommy! I love you!");
            const voices = window.speechSynthesis.getVoices();
            const babyVoice = voices.find(v => (v.name.toLowerCase().includes('child') || v.name.toLowerCase().includes('girl') || v.name.toLowerCase().includes('kid')) && v.lang.startsWith('en')) ||
                voices.find(v => v.name.includes('Google US English') && v.lang.startsWith('en')) ||
                voices.find(v => v.name.includes('Female') && v.lang.startsWith('en'));
            if (babyVoice) msg.voice = babyVoice;

            msg.rate = 1.4;
            msg.pitch = 2.0;
            msg.volume = 1;
            window.speechSynthesis.speak(msg);
        };

        const timer = setTimeout(() => {
            speak();
            setSwirl(false); // Stop swirling after a bit
        }, 1500);

        const dismissTimer = setTimeout(() => {
            onComplete();
        }, 5500);

        return () => {
            clearTimeout(timer);
            clearTimeout(dismissTimer);
            window.speechSynthesis.cancel();
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <group>
                    {swirl ? (
                        <group rotation={[0, 0, 0]}>
                            {/* Swirling animation logic would go here, simplified to centering for now with float */}
                            <Float speed={5} rotationIntensity={2} floatIntensity={2}>
                                <CuteBabyRobot />
                            </Float>
                        </group>
                    ) : (
                        <group>
                            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                                <CuteBabyRobot />
                            </Float>
                        </group>
                    )}
                </group>
                <OrbitControls enableZoom={false} />
            </Canvas>
        </div>
    );
};

export default AiBaby3D;
