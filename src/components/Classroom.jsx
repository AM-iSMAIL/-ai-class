import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Key,
  Check,
  ChevronRight,
  BookOpen,
  Clock,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Image,
  Mic,
  MicOff,
  Search,
  PlusCircle,
  Video,
  MonitorPlay,
  Layers,
  HelpCircle,
} from 'lucide-react';

// Fallback high-quality lecture slides if Gemini API key is missing or fails
const getFallbackSlides = (topic) => {
  const lower = topic.toLowerCase();
  
  if (lower.includes('neural') || lower.includes('network') || lower.includes('perceptron') || lower.includes('neuron')) {
    return [
      {
        title: "Introduction to Artificial Neural Networks",
        bulletPoints: [
          "Inspired by biological networks of neurons in the human brain",
          "Core architecture: Input layer, hidden layers, and output layer",
          "Signal transmission governed by connection weights and node biases"
        ],
        speakerNotes: `Welcome to our session on neural networks. Today, we will explore how computational graphs model complex functions. Just as biological brains transmit signals via synapses, artificial networks use weighted connections to process information.`,
        visualDescription: "A layer-based neural network diagram showing input nodes feeding into a hidden neuron with weights.",
        imagePrompt: "A futuristic glowing network of interconnected nodes and synapses, digital art style."
      },
      {
        title: "The Mathematical Model of a Neuron",
        bulletPoints: [
          "Linear combination: Computing the weighted sum of inputs plus bias",
          "Activation function: Introducing non-linearity into the network",
          "Enables modeling of complex decision boundaries beyond linear cuts"
        ],
        speakerNotes: "Let's examine the mathematical mechanics of a single artificial neuron. We calculate the sum of all inputs multiplied by their weights, add a bias term, and pass the result through an activation function to introduce non-linearity.",
        visualDescription: "An equation diagram summing inputs x_i * w_i plus bias, feeding into activation f(z).",
        imagePrompt: "Mathematical formula schematic of neuron activation function on a dark digital board."
      },
      {
        title: "Training Networks: The Feedforward Process",
        bulletPoints: [
          "Forward propagation: Passing inputs through layers to compute output",
          "Loss function: Quantifying prediction error against target labels",
          "Common error metrics: Mean Squared Error (MSE) and Cross-Entropy"
        ],
        speakerNotes: "During forward propagation, data flows from the input layer through the hidden layers to the output. We evaluate the final predictions using a loss function, which quantifies the discrepancy between our model's predictions and actual targets.",
        visualDescription: "A flowchart showing forward data flow from inputs through hidden layers to a loss node.",
        imagePrompt: "A sleek visualization of data packets flowing left-to-right through layer grids."
      },
      {
        title: "Learning and Optimization: Backpropagation",
        bulletPoints: [
          "Gradient Descent: Iteratively adjusting weights to minimize loss",
          "The Chain Rule: Calculating partial derivatives of loss with respect to weights",
          "Learning rate: Pacing parameter determining size of gradient steps"
        ],
        speakerNotes: "To train the network, we compute the gradient of the loss function using the calculus chain rule, propagating backward. We then adjust each weight in the direction that minimizes loss, guided by the learning rate.",
        visualDescription: "A gradient descent cost function curve showing a ball rolling down to the global minimum.",
        imagePrompt: "A dynamic 3D landscape diagram illustrating optimization paths to a valley."
      }
    ];
  }

  if (lower.includes('backprop') || lower.includes('gradient') || lower.includes('train') || lower.includes('optimi') || lower.includes('descent')) {
    return [
      {
        title: "Foundations of Gradient Descent",
        bulletPoints: [
          "Optimization objective: Finding weight configurations that minimize error",
          "Loss landscapes: Conceptualizing error as a high-dimensional surface",
          "Steepest descent direction: Moving opposite to the gradient vector"
        ],
        speakerNotes: `Today, we dive into how neural networks learn. Optimization algorithms seek to minimize a loss function. By visualizing this function as a landscape, we can use gradient vectors to find the steepest path downhill.`,
        visualDescription: "A 3D surface plot representing a loss landscape with peaks and valleys.",
        imagePrompt: "A colorful 3D topological map showcasing optimization paths, technological layout."
      },
      {
        title: "The Chain Rule & Backpropagation",
        bulletPoints: [
          "Computing gradients in layered computational graphs",
          "Backward pass: Transmitting error signals from output back to input",
          "Calculating partial derivatives of loss for individual parameters"
        ],
        speakerNotes: "Backpropagation is simply an application of the calculus chain rule. By working backwards from the output, we calculate how small changes in each weight affect the final loss, allowing systematic updates.",
        visualDescription: "A computational graph diagram with forward and backward derivative arrows.",
        imagePrompt: "Abstract derivative formulas floating over a structured network diagram, blue neon style."
      },
      {
        title: "Learning Rates & Gradient Step Sizes",
        bulletPoints: [
          "Defining step size: Balancing training speed and convergence stability",
          "Underfitting vs Overfitting: Consequences of poor step sizes",
          "Adaptive optimizers: Introduction to Adam, RMSProp, and Momentum"
        ],
        speakerNotes: "Choosing the right learning rate is crucial. A rate that is too high causes the model to overshoot the minimum, while a rate that is too low leads to extremely slow convergence or getting stuck in local minima.",
        visualDescription: "A comparison graph showing diverging, oscillating, and converging optimization paths.",
        imagePrompt: "A chart showing vector arrows of different sizes climbing down a parabolic curve."
      },
      {
        title: "Challenges in Optimization",
        bulletPoints: [
          "Vanishing gradients: Activations shrinking error signals to zero",
          "Exploding gradients: Unstable parameters causing training to fail",
          "Saddle points and local minima: Navigating flat plateau regions"
        ],
        speakerNotes: "Deep networks face severe gradient challenges. Error signals can fade entirely or grow uncontrollably. Modern techniques like batch normalization and skip connections are designed to mitigate these issues.",
        visualDescription: "A line chart showing gradient magnitude decaying exponentially across multiple layers.",
        imagePrompt: "A high-tech grid diagram showing signals fading as they traverse deep network layers."
      }
    ];
  }

  // General default fallback slides (designed to be highly academic and clean)
  return [
    {
      title: `Introduction to ${topic}`,
      bulletPoints: [
        `Historical emergence and core definitions of ${topic}`,
        `Primary components and boundary conditions of the system`,
        `Fundamental goals and qualitative concepts of the study`
      ],
      speakerNotes: `Welcome to our session on "${topic}". In undergraduate studies, understanding the foundational principles of this subject is essential for analyzing more complex systems. Today, we will explore the core concepts step-by-step to build a robust mental model.`,
      visualDescription: `A conceptual diagram showing key elements and inputs of ${topic}.`,
      imagePrompt: `A clean, academic minimalist illustration showcasing ${topic} elements.`
    },
    {
      title: `Theoretical Models and Equations`,
      bulletPoints: [
        `Formulating governing equations and parameters of ${topic}`,
        `Analytic solutions under ideal and restricted conditions`,
        `Analyzing linear and non-linear system responses`
      ],
      speakerNotes: `First, let's look at the primary definitions and mechanics. "${topic}" operates under key rules and parameters that describe how variables interact. By breaking down the active forces, we can predict behaviors and calculate outcomes under various constraints.`,
      visualDescription: `A mathematical representation showing relations between system variables.`,
      imagePrompt: `An elegant scientific diagram with mathematical symbols representing ${topic}.`
    },
    {
      title: `Empirical Observations & Real-World Puzzles`,
      bulletPoints: [
        `Comparing analytical model outputs with physical measurements`,
        `Sources of variance: system errors, resistance, and noise`,
        `Designing robust experiments to isolate variables`
      ],
      speakerNotes: `Next, we observe how this concept applies in real-world environments. Theoretical models often assume ideal conditions, but in practice, factors like resistance, external variables, or systemic errors affect the system. Understanding these variances is crucial for practical engineering and research.`,
      visualDescription: `A comparison chart plotting theoretical lines against scattered empirical data points.`,
      imagePrompt: `An experimental laboratory setup for testing and measuring ${topic} variables.`
    },
    {
      title: `Synthesis, Applications, and Future Trends`,
      bulletPoints: [
        `Bridging academic theory with practical engineering designs`,
        `Solving multi-variable case studies and analytical problems`,
        `Open research directions and emerging breakthroughs in ${topic}`
      ],
      speakerNotes: `Finally, let's synthesize these ideas. By connecting the mathematical foundations with empirical observations, we can solve complex analytical problems. As we transition to the topic evaluation, keep in mind how these relationships apply to different scenarios.`,
      visualDescription: `A unified block schematic diagram showing all components of ${topic} integrated.`,
      imagePrompt: `A futuristic digital collage representing the application and future of ${topic}.`
    }
  ];
};

const cleanJsonString = (rawText) => {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  }

  const arrayStart = cleaned.indexOf('{');
  const arrayEnd = cleaned.lastIndexOf('}');
  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    cleaned = cleaned.slice(arrayStart, arrayEnd + 1);
  }

  return cleaned;
};

// Smart keyword extraction utility
const extractKeywords = (name) => {
  const stopwords = new Set([
    'of', 'and', 'the', 'in', 'a', 'to', 'for', 'on', 'is', 'at', 'by', 'with',
    'about', 'from', 'an', 'law', 'laws', 'theory', 'concept', 'introduction',
    'topic', 'topics', 'basic', 'basics', 'advanced', 'principles', 'understanding'
  ]);
  
  const clean = name.toLowerCase().replace(/[^\w\s]/g, '');
  const words = clean.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));
  
  const keywords = [];
  for (const w of words) {
    if (keywords.length < 2 && !keywords.includes(w)) {
      keywords.push(w);
    }
  }
  
  const fallbackWords = name.split(/\s+/).filter(w => w.length > 1);
  for (const w of fallbackWords) {
    const lw = w.toLowerCase().replace(/[^\w\s]/g, '').trim();
    if (keywords.length < 2 && !keywords.includes(lw) && lw.length > 1 && !stopwords.has(lw)) {
      keywords.push(lw);
    }
  }
  
  while (keywords.length < 2) {
    keywords.push(keywords.length === 0 ? 'science' : 'education');
  }
  
  return keywords;
};

// Helper to extract YouTube video ID
const extractYoutubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Local curated educational YouTube search database
const searchYoutubeVideos = async (query) => {
  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  
  // Try fetching from public Invidious API
  try {
    const res = await fetch(`https://vid.puffyan.us/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data) && data.length > 0) {
        return data.slice(0, 5).map(item => ({
          videoId: item.videoId,
          title: item.title,
          author: item.author,
          thumbnail: item.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${item.videoId}/0.jpg`,
        }));
      }
    }
  } catch (err) {
    console.warn("Public YouTube search API failed, using local educational index fallback:", err);
  }

  // High quality educational playlist mapping
  const curatedList = [
    {
      keywords: ['neural network', 'deep learning', 'what is a neural network', 'perceptron', 'neuron'],
      videos: [
        { videoId: 'aircAruvnKk', title: 'But what is a neural network? | Chapter 1, Deep learning', author: '3Blue1Brown' },
        { videoId: 'IHZwWFHWa-w', title: 'Gradient descent, how neural networks learn | Chapter 2', author: '3Blue1Brown' },
        { videoId: 'Ilg3gGewQ5U', title: 'What is backpropagation, and what is it actually doing? | Chapter 3', author: '3Blue1Brown' },
        { videoId: 'tIeHLnjs5U8', title: 'Backpropagation calculus | Chapter 4, Deep learning', author: '3Blue1Brown' },
        { videoId: 'zxWYJyFWRK0', title: 'Neural Networks Explained from Scratch', author: 'StatQuest' }
      ]
    },
    {
      keywords: ['backpropagation', 'backprop', 'chain rule', 'gradient', 'gradient descent'],
      videos: [
        { videoId: 'Ilg3gGewQ5U', title: 'What is backpropagation, and what is it actually doing? | Chapter 3', author: '3Blue1Brown' },
        { videoId: 'tIeHLnjs5U8', title: 'Backpropagation calculus | Chapter 4, Deep learning', author: '3Blue1Brown' },
        { videoId: 'q555kfIFUCM', title: 'Backpropagation Main Ideas', author: 'StatQuest' },
        { videoId: 'GKZo7NPDDCI', title: 'Neural Networks: Backpropagation & Gradient Descent', author: 'Computerphile' }
      ]
    },
    {
      keywords: ['activation function', 'relu', 'sigmoid', 'tanh', 'swish', 'gelu'],
      videos: [
        { videoId: 'gYpoJMIdxux', title: 'Activation Functions Explained', author: 'StatQuest' },
        { videoId: 'm0pIlLfpXWE', title: 'Sigmoid, ReLU, Tanh Activation Functions', author: 'DeepLizard' },
        { videoId: '83pT15eO428', title: 'Activation Functions in Neural Networks', author: 'Computerphile' }
      ]
    },
    {
      keywords: ['decision tree', 'random forest', 'entropy', 'information gain'],
      videos: [
        { videoId: '7VeUPuFGJHk', title: 'Decision Trees Explained', author: 'StatQuest' },
        { videoId: 'J4Wdy0Wc_xQ', title: 'Random Forests Explained', author: 'StatQuest' },
        { videoId: 'LDRbARMSgME', title: 'Entropy and Information Gain in Decision Trees', author: 'StatQuest' }
      ]
    },
    {
      keywords: ['unsupervised', 'clustering', 'k-means', 'pca', 'dimensionality'],
      videos: [
        { videoId: 'FakbGcyshyw', title: 'K-Means Clustering Explained', author: 'StatQuest' },
        { videoId: 'FgaUQP60dPE', title: 'Principal Component Analysis (PCA) Step-by-Step', author: 'StatQuest' },
        { videoId: 'ne-dP34ZIZ8', title: 'Hierarchical Clustering Explained', author: 'StatQuest' }
      ]
    },
    {
      keywords: ['overfit', 'underfit', 'regularization', 'lasso', 'ridge', 'bias', 'variance'],
      videos: [
        { videoId: 'Q81RR3yKn30', title: 'Machine Learning: Bias vs Variance (Overfitting)', author: 'StatQuest' },
        { videoId: 'Q81yN07u_EU', title: 'Regularization Part 1: Ridge Regression', author: 'StatQuest' },
        { videoId: 'NGf0yZ1AcSU', title: 'Regularization Part 2: Lasso Regression', author: 'StatQuest' }
      ]
    }
  ];

  const match = curatedList.find(cat => 
    cat.keywords.some(keyword => lowerQuery.includes(keyword))
  );

  if (match) {
    return match.videos.map(v => ({
      ...v,
      thumbnail: `https://img.youtube.com/vi/${v.videoId}/0.jpg`
    }));
  }

  // General default high-quality education videos
  return [
    { videoId: 'aircAruvnKk', title: 'But what is a neural network? | Chapter 1, Deep learning', author: '3Blue1Brown', thumbnail: 'https://img.youtube.com/vi/aircAruvnKk/0.jpg' },
    { videoId: 'zxWYJyFWRK0', title: 'Neural Networks Explained from Scratch', author: 'StatQuest', thumbnail: 'https://img.youtube.com/vi/zxWYJyFWRK0/0.jpg' },
    { videoId: 'IHZwWFHWa-w', title: 'Gradient descent, how neural networks learn | Chapter 2', author: '3Blue1Brown', thumbnail: 'https://img.youtube.com/vi/IHZwWFHWa-w/0.jpg' }
  ];
};

export default function Classroom({
  onNext,
  classData,
  apiKey,
  onSaveApiKey,
  unsplashClientId,
  onSaveUnsplashClientId,
  elevenLabsApiKey,
  onSaveElevenLabsApiKey,
  currentTopicIndex = 0,
  onExplanationReady,
  studentInfo,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const topicName = classData?.topics?.[currentTopicIndex] || 'Selected Topic';
  const totalTopics = classData?.topics?.length || 6;
  const keywords = useMemo(() => extractKeywords(topicName), [topicName]);

  // Whiteboard Dynamic state
  const [boardState, setBoardState] = useState({
    title: `Live Lecture: ${topicName}`,
    bulletPoints: [
      'Toggle the microphone below to start teaching.',
      'Speak clearly about the topic to generate whiteboard summaries.',
      'Search or paste YouTube links to project reference videos.',
      'AI will dynamically outline diagrams and note keys in real-time.'
    ],
    visualDescription: 'Awaiting dynamic whiteboard sketches and live schematics.',
    youtubeSearchQuery: topicName,
    activeVideoId: null,
    isVideoVisible: false,
    activeTab: 'schematic', // schematic | illustration | video
  });

  // Dynamic slides history accumulated for Quiz generation
  const [liveSlidesHistory, setLiveSlidesHistory] = useState(() => getFallbackSlides(topicName));

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [cumulativeTranscript, setCumulativeTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [lastProcessedText, setLastProcessedText] = useState('');
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [generatingBoard, setGeneratingBoard] = useState(false);
  const [simulationText, setSimulationText] = useState('');

  // Speech API recognition ref
  const recognitionRef = useRef(null);

  // Unsplash Image state
  const [unsplashImage, setUnsplashImage] = useState(null);
  const [unsplashLoading, setUnsplashLoading] = useState(false);

  // YouTube search results
  const [youtubeResults, setYoutubeResults] = useState([]);
  const [youtubeSearching, setYoutubeSearching] = useState(false);
  const [customVideoQuery, setCustomVideoQuery] = useState('');

  const [timeLeft, setTimeLeft] = useState((classData?.duration || 10) * 60);
  const [topicComplete, setTopicComplete] = useState(false);
  const [transitionCountdown, setTransitionCountdown] = useState(3);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);

  // Student-side local TTS reader to narrate live lecture updates
  const lastSpokenRef = useRef('');

  useEffect(() => {
    if (!studentInfo || isMuted || !boardState.title || volume === 0) {
      if (studentInfo && (isMuted || volume === 0) && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }
    
    const contentKey = `${boardState.title}_${(boardState.bulletPoints || []).join('|')}_${volume}`;
    if (contentKey === lastSpokenRef.current) return;
    lastSpokenRef.current = contentKey;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      const speechText = `${boardState.title}. ${boardState.bulletPoints.join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = 0.92; // Clear, professional pacing
      utterance.pitch = 1.0;
      utterance.volume = volume;
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
      
      const preferredPatterns = [
        /Google.*US/i,              // Google US English (Chrome)
        /Google.*UK/i,              // Google UK English (Chrome)
        /Microsoft.*Online.*Natural/i, // Microsoft Edge Neural voices
        /Samantha/i,                // macOS high-quality voice
        /Daniel/i,                  // macOS UK voice
        /Karen/i,                   // macOS Australian voice
        /Zira/i,                    // Windows Zira
        /David/i,                   // Windows David
        /Mark/i,                    // Windows Mark
      ];

      let selectedVoice = null;
      for (const pattern of preferredPatterns) {
        selectedVoice = englishVoices.find((v) => pattern.test(v.name));
        if (selectedVoice) break;
      }

      if (!selectedVoice) {
        selectedVoice = englishVoices[0] || voices[0];
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }, [boardState.title, boardState.bulletPoints, studentInfo, isMuted, volume]);

  // Settings Panel
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [unsplashInput, setUnsplashInput] = useState(unsplashClientId || '');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Initial Sync of dynamic history for Quiz
  useEffect(() => {
    onExplanationReady?.(currentTopicIndex, liveSlidesHistory);
  }, [currentTopicIndex, liveSlidesHistory, onExplanationReady]);

  // Speech Recognition Engine initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (final) {
        setCumulativeTranscript(prev => prev + final);
        setSpeechTranscript(prev => prev + final);
      }
      setInterimTranscript(interim);
    };

    rec.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        setIsListening(false);
      }
    };

    rec.onend = () => {
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Failed to restart speech recognition:", e);
        }
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isListening]);

  // Handle listening state toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setInterimTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  // Debounced auto whiteboard update
  useEffect(() => {
    if (!isListening || !autoGenerate || !speechTranscript) return;

    const unprocessed = speechTranscript.slice(lastProcessedText.length).trim();
    if (unprocessed.length < 50) return; // Wait for ~10-15 words

    const timer = setTimeout(() => {
      generateBoardUpdate(speechTranscript);
    }, 3000); // 3 seconds of pause

    return () => clearTimeout(timer);
  }, [speechTranscript, lastProcessedText, isListening, autoGenerate]);

  // Generate Whiteboard Content via Gemini API or Mock Fallback
  const generateBoardUpdate = async (fullText) => {
    if (!fullText || generatingBoard) return;
    setGeneratingBoard(true);

    const textSegment = fullText.slice(lastProcessedText.length).trim();
    if (!textSegment) {
      setGeneratingBoard(false);
      return;
    }

    setLastProcessedText(fullText);

    if (!apiKey) {
      simulateMockBoardUpdate(textSegment);
      setGeneratingBoard(false);
      return;
    }

    const promptText = `You are an AI teaching assistant. The teacher is giving a live lecture on the topic: "${topicName}".
Here is the transcript of what the teacher has said so far in this lecture segment:
"${textSegment}"

Current whiteboard state:
Title: "${boardState.title}"
Bullet points: ${JSON.stringify(boardState.bulletPoints)}

Your task is to update the whiteboard dynamically based on the teacher's spoken words.
1. If the teacher transitions to a new subtopic, update the title to a concise heading (3-5 words). Otherwise, keep the current title or make a slight refinement.
2. Update or extend the list of bullet points (maximum 5 points). Ensure they are concise, professional, and capture the key educational points the teacher has just spoken. Do not repeat existing points.
3. Generate a concise visual diagram description (1-2 sentences) of what should be drawn or visualized on the board to illustrate this concept.
4. Formulate a short search query (2-3 keywords) to search YouTube for reference videos matching the specific concept being explained.

You must respond ONLY with a JSON object matching this structure:
{
  "title": "Concise Subtopic Title",
  "bulletPoints": ["point 1", "point 2", "point 3"],
  "visualDescription": "Visual representation description",
  "youtubeSearchQuery": "keyword search query"
}
Return ONLY the raw JSON object. Do not wrap in markdown code blocks or add extra explanation.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
          }),
        }
      );

      if (!response.ok) throw new Error(`Gemini status ${response.status}`);

      const data = await response.json();
      const rawRes = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawRes) {
        const cleaned = cleanJsonString(rawRes);
        const parsed = JSON.parse(cleaned);

        const newBoardState = {
          ...boardState,
          title: parsed.title || boardState.title,
          bulletPoints: Array.isArray(parsed.bulletPoints) ? parsed.bulletPoints : boardState.bulletPoints,
          visualDescription: parsed.visualDescription || boardState.visualDescription,
          youtubeSearchQuery: parsed.youtubeSearchQuery || boardState.youtubeSearchQuery,
        };

        setBoardState(newBoardState);

        const newSlide = {
          title: newBoardState.title,
          bulletPoints: newBoardState.bulletPoints,
          speakerNotes: textSegment,
          visualDescription: newBoardState.visualDescription
        };

        setLiveSlidesHistory(prev => {
          const updated = [...prev, newSlide];
          if (updated.length > 6) updated.shift();
          onExplanationReady?.(currentTopicIndex, updated);
          return updated;
        });

        if (parsed.youtubeSearchQuery && parsed.youtubeSearchQuery !== boardState.youtubeSearchQuery) {
          handleYoutubeSearch(parsed.youtubeSearchQuery);
        }
      }
    } catch (err) {
      console.error("Gemini live board generation failed:", err);
      simulateMockBoardUpdate(textSegment);
    } finally {
      setGeneratingBoard(false);
    }
  };

  // Simulated AI responses based on speech segments
  const simulateMockBoardUpdate = (textSegment) => {
    const lowerText = textSegment.toLowerCase();
    let title = boardState.title;
    let points = [...boardState.bulletPoints];
    let visual = boardState.visualDescription;
    let query = boardState.youtubeSearchQuery;

    if (lowerText.includes('neural') || lowerText.includes('network') || lowerText.includes('neuron')) {
      title = "Neural Network Architecture";
      points = [
        "Layered structure consisting of input, hidden, and output layers",
        "Weighted connections represent signal strength between neurons",
        "Activation functions introduce non-linearity to map complex relationships"
      ];
      visual = "Network diagram showing nodes, layers, and weighted connection paths.";
      query = "neural network architecture";
    } else if (lowerText.includes('backprop') || lowerText.includes('gradient') || lowerText.includes('chain rule')) {
      title = "Backpropagation & Gradient Descent";
      points = [
        "Calculating loss gradients using the mathematical chain rule",
        "Propagating error backwards from output to adjust connection weights",
        "Optimizing weights to find the global minimum in loss landscape"
      ];
      visual = "Computational graph with forward and backward derivative flow arrows.";
      query = "backpropagation main ideas";
    } else if (lowerText.includes('activation') || lowerText.includes('relu') || lowerText.includes('sigmoid')) {
      title = "Activation Functions";
      points = [
        "Sigmoid compresses values to a range between 0 and 1",
        "ReLU outputs input directly if positive, preventing vanishing gradients",
        "Activations enable the network to learn non-linear boundaries"
      ];
      visual = "Ramp function graph comparing Swish, Swish-GELU, and ReLU shapes.";
      query = "activation functions relu sigmoid";
    } else {
      title = "Live Lecture Highlights";
      const snippet = textSegment.split(/\s+/).slice(0, 8).join(' ');
      points = [
        `Explaining: "${snippet}..."`,
        "Analyzing governing equations and systems in real-time",
        "Formulating logical bounds and conceptual structures"
      ];
      visual = "Dynamic conceptual schematic relating current teaching topics.";
      query = topicName;
    }

    const newBoardState = {
      ...boardState,
      title,
      bulletPoints: points,
      visualDescription: visual,
      youtubeSearchQuery: query,
    };

    setBoardState(newBoardState);

    const newSlide = {
      title,
      bulletPoints: points,
      speakerNotes: textSegment,
      visualDescription: visual
    };

    setLiveSlidesHistory(prev => {
      const updated = [...prev, newSlide];
      if (updated.length > 6) updated.shift();
      onExplanationReady?.(currentTopicIndex, updated);
      return updated;
    });

    if (query) {
      handleYoutubeSearch(query);
    }
  };

  // Simulate speaking for testing/simulations
  const handleSimulateSpeech = () => {
    if (!simulationText.trim()) return;
    const cleanText = simulationText.trim();
    setCumulativeTranscript(prev => prev + cleanText + ' ');
    setSpeechTranscript(prev => prev + cleanText + ' ');
    generateBoardUpdate(speechTranscript + cleanText + ' ');
    setSimulationText('');
  };

  // Fetch Unsplash Image for the current title
  useEffect(() => {
    if (!unsplashClientId || !boardState.title) return;
    let active = true;
    const fetchImage = async () => {
      unsplashLoading || setUnsplashLoading(true);
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            boardState.title
          )}&per_page=1&client_id=${unsplashClientId}`
        );
        if (res.ok) {
          const data = await res.json();
          const url = data?.results?.[0]?.urls?.regular;
          if (active && url) {
            setUnsplashImage(url);
          }
        }
      } catch (err) {
        console.warn("Unsplash fetch failed:", err);
      } finally {
        if (active) setUnsplashLoading(false);
      }
    };
    fetchImage();
    return () => { active = false; };
  }, [boardState.title, unsplashClientId]);

  // YouTube Search Logic
  const handleYoutubeSearch = async (query) => {
    if (!query) return;
    setYoutubeSearching(true);
    try {
      const results = await searchYoutubeVideos(query);
      setYoutubeResults(results);
    } catch (err) {
      console.error("YouTube search error:", err);
    } finally {
      setYoutubeSearching(false);
    }
  };

  // Trigger search on mount or topic name changes
  useEffect(() => {
    handleYoutubeSearch(topicName);
  }, [topicName]);

  // Direct YouTube Link loader
  const loadCustomVideo = () => {
    if (!customVideoQuery) return;
    const videoId = extractYoutubeId(customVideoQuery) || customVideoQuery.trim();
    if (videoId.length === 11) {
      setBoardState(prev => ({
        ...prev,
        activeVideoId: videoId,
        isVideoVisible: true,
        activeTab: 'video',
      }));
      setCustomVideoQuery('');
    } else {
      alert("Please enter a valid YouTube Video URL or 11-character Video ID.");
    }
  };

  // Synchronize whiteboard states across Teacher/Students
  useEffect(() => {
    if (studentInfo) return; // Student only listens

    if (db && classData?.sessionCode) {
      updateDoc(doc(db, "sessions", classData.sessionCode), {
        boardState: boardState,
        liveTranscript: cumulativeTranscript,
        isListening: isListening,
      }).catch(err => console.error("Firestore sync boardState update failed:", err));
    } else {
      // Local sync via BroadcastChannel
      const channel = new BroadcastChannel('classai_local_sync');
      channel.postMessage({
        type: 'BOARD_STATE_UPDATE',
        payload: {
          boardState,
          liveTranscript: cumulativeTranscript,
          isListening,
        }
      });
      channel.close();
    }
  }, [boardState, cumulativeTranscript, isListening, studentInfo, classData?.sessionCode]);

  // Student listener for real-time synchronization
  useEffect(() => {
    if (!studentInfo) return; // Teacher doesn't listen

    if (db && classData?.sessionCode) {
      const sessionDocRef = doc(db, "sessions", classData.sessionCode);
      const unsubscribe = onSnapshot(sessionDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.boardState) {
            setBoardState(data.boardState);
          }
          if (data.liveTranscript) {
            setCumulativeTranscript(data.liveTranscript);
          }
          if (data.isListening !== undefined) {
            setIsListening(data.isListening);
          }
        }
      });
      return () => unsubscribe();
    } else {
      const channel = new BroadcastChannel('classai_local_sync');
      const handleMessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'BOARD_STATE_UPDATE') {
          if (payload.boardState) {
            setBoardState(payload.boardState);
          }
          if (payload.liveTranscript) {
            setCumulativeTranscript(payload.liveTranscript);
          }
          if (payload.isListening !== undefined) {
            setIsListening(payload.isListening);
          }
        }
      };
      channel.addEventListener('message', handleMessage);
      return () => {
        channel.removeEventListener('message', handleMessage);
        channel.close();
      };
    }
  }, [classData?.sessionCode, studentInfo]);

  // Topic session timer loop
  useEffect(() => {
    if (loading || topicComplete) return;
    if (timeLeft <= 0) {
      handleTopicComplete();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, topicComplete]);

  const handleTopicComplete = useCallback(() => {
    setTopicComplete(true);
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  // Quiz auto-navigation transition countdown
  useEffect(() => {
    if (!topicComplete || studentInfo) return;
    if (transitionCountdown <= 0) {
      handleNext();
      return;
    }
    const timer = setTimeout(() => {
      setTransitionCountdown(c => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [topicComplete, transitionCountdown, studentInfo]);

  const handleNext = () => {
    if (db && classData?.sessionCode && !studentInfo) {
      updateDoc(doc(db, "sessions", classData.sessionCode), {
        status: 'quiz'
      }).catch(err => console.error("Firestore quiz transition failed:", err));
    } else if (!db && classData?.sessionCode && !studentInfo) {
      const channel = new BroadcastChannel('classai_local_sync');
      channel.postMessage({
        type: 'SESSION_STATE_UPDATE',
        payload: { status: 'quiz' }
      });
      channel.close();
    }
    onNext();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const saveSettings = () => {
    onSaveApiKey(keyInput.trim());
    onSaveUnsplashClientId(unsplashInput.trim());
    setSettingsSaved(true);
    setTimeout(() => {
      setSettingsSaved(false);
      setShowKeyPanel(false);
    }, 1200);
  };

  // Local SVGs for dynamic schematics on board
  const renderWhiteboardSchematic = () => {
    const indexKey = currentTopicIndex % 6;
    switch (indexKey) {
      case 0: // Neural Networks
        return (
          <svg viewBox="0 0 400 160" className="w-full h-full fill-none" strokeWidth="1.5">
            <style>{`
              @keyframes dash {
                to { stroke-dashoffset: -20; }
              }
              .pulse-line {
                stroke: #3b82f6;
                stroke-dasharray: 4 6;
                animation: dash 1.5s linear infinite;
              }
              .pulse-line-fast {
                stroke: #ec4899;
                stroke-dasharray: 4 6;
                animation: dash 1s linear infinite;
              }
              @keyframes nodePulse {
                0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(59,130,246,0.3)); }
                50% { transform: scale(1.1); filter: drop-shadow(0 0 6px rgba(59,130,246,0.7)); }
              }
              .node-pulse {
                transform-origin: center;
                animation: nodePulse 2.5s ease-in-out infinite;
              }
            `}</style>
            
            {/* Connection Lines */}
            {/* Input to Hidden */}
            <line x1="80" y1="50" x2="200" y2="30" className="pulse-line" />
            <line x1="80" y1="50" x2="200" y2="80" className="pulse-line-fast" />
            <line x1="80" y1="50" x2="200" y2="130" className="pulse-line" />
            <line x1="80" y1="110" x2="200" y2="30" className="pulse-line" />
            <line x1="80" y1="110" x2="200" y2="80" className="pulse-line" />
            <line x1="80" y1="110" x2="200" y2="130" className="pulse-line-fast" />
            
            {/* Hidden to Output */}
            <line x1="200" y1="30" x2="320" y2="80" className="pulse-line" />
            <line x1="200" y1="80" x2="320" y2="80" className="pulse-line-fast" />
            <line x1="200" y1="130" x2="320" y2="80" className="pulse-line" />
            
            {/* Nodes */}
            {/* Input Layer */}
            <circle cx="80" cy="50" r="10" className="fill-blue-50 stroke-blue-500 node-pulse" />
            <circle cx="80" cy="110" r="10" className="fill-blue-50 stroke-blue-500 node-pulse" />
            <text x="50" y="53" className="fill-blue-600 font-mono text-[8px] font-bold">In x1</text>
            <text x="50" y="113" className="fill-blue-600 font-mono text-[8px] font-bold">In x2</text>
            
            {/* Hidden Layer */}
            <circle cx="200" cy="30" r="10" className="fill-purple-50 stroke-purple-500 node-pulse" />
            <circle cx="200" cy="80" r="10" className="fill-purple-50 stroke-purple-500 node-pulse" />
            <circle cx="200" cy="130" r="10" className="fill-purple-50 stroke-purple-500 node-pulse" />
            <text x="195" y="33" className="fill-purple-700 font-mono text-[8px] font-bold">h1</text>
            <text x="195" y="83" className="fill-purple-700 font-mono text-[8px] font-bold">h2</text>
            <text x="195" y="133" className="fill-purple-700 font-mono text-[8px] font-bold">h3</text>
            
            {/* Output Layer */}
            <circle cx="320" cy="80" r="10" className="fill-pink-50 stroke-pink-500 node-pulse" />
            <text x="338" y="83" className="fill-pink-600 font-mono text-[8px] font-bold">Out y</text>
            
            {/* Labels */}
            <text x="70" y="15" className="fill-slate-400 font-mono text-[7px] tracking-widest font-bold">INPUTS</text>
            <text x="180" y="15" className="fill-slate-400 font-mono text-[7px] tracking-widest font-bold">HIDDEN LAYERS</text>
            <text x="300" y="15" className="fill-slate-400 font-mono text-[7px] tracking-widest font-bold">OUTPUT</text>
          </svg>
        );
      case 1: // Supervised Learning
        return (
          <svg viewBox="0 0 400 160" className="w-full h-full fill-none" strokeWidth="1.5">
            <style>{`
              @keyframes sweepLine {
                0%, 100% { transform: rotate(-3deg); }
                50% { transform: rotate(5deg); }
              }
              .bound-line {
                stroke: #10b981;
                transform-origin: 200px 80px;
                animation: sweepLine 5s ease-in-out infinite;
              }
              @keyframes blinkNode {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
              }
              .group-a { fill: #ef4444; stroke: #b91c1c; }
              .group-b { fill: #3b82f6; stroke: #1d4ed8; }
              .blink-dot { animation: blinkNode 2s infinite ease-in-out; }
            `}</style>
            
            {/* Graph Grid */}
            <path d="M 50 130 L 350 130 M 50 20 L 50 130" stroke="#cbd5e1" strokeWidth="1" />
            
            {/* Group A (Red Circles - e.g., Class 0) */}
            <circle cx="80" cy="40" r="6" className="group-a blink-dot" />
            <circle cx="110" cy="60" r="6" className="group-a" />
            <circle cx="130" cy="35" r="6" className="group-a" />
            <circle cx="150" cy="70" r="6" className="group-a blink-dot" />
            
            {/* Group B (Blue Circles - e.g., Class 1) */}
            <circle cx="250" cy="95" r="6" className="group-b" />
            <circle cx="280" cy="110" r="6" className="group-b blink-dot" />
            <circle cx="300" cy="80" r="6" className="group-b" />
            <circle cx="320" cy="105" r="6" className="group-b blink-dot" />
            
            {/* Interactive Classification Boundary */}
            <line x1="60" y1="110" x2="340" y2="50" className="bound-line" strokeWidth="2.5" />
            
            <text x="180" y="120" className="fill-emerald-600 font-mono text-[8px] font-bold">Decision Boundary</text>
            <text x="70" y="25" className="fill-red-500 font-mono text-[7px] font-bold">Class A (Red)</text>
            <text x="280" y="25" className="fill-blue-500 font-mono text-[7px] font-bold">Class B (Blue)</text>
          </svg>
        );
      case 2: // Unsupervised Learning
        return (
          <svg viewBox="0 0 400 160" className="w-full h-full fill-none" strokeWidth="1.5">
            <style>{`
              @keyframes centroid1 {
                0%, 100% { transform: translate(0px, 0px); }
                50% { transform: translate(15px, -10px); }
              }
              @keyframes centroid2 {
                0%, 100% { transform: translate(0px, 0px); }
                50% { transform: translate(-15px, 10px); }
              }
              .centroid-red {
                stroke: #ef4444;
                fill: #fee2e2;
                animation: centroid1 4s ease-in-out infinite;
              }
              .centroid-blue {
                stroke: #3b82f6;
                fill: #dbe1ff;
                animation: centroid2 4s ease-in-out infinite;
              }
              @keyframes pulseLine {
                0%, 100% { stroke-opacity: 0.2; }
                50% { stroke-opacity: 0.7; }
              }
              .cluster-line {
                stroke: #cbd5e1;
                stroke-dasharray: 2 2;
                animation: pulseLine 2s infinite ease-in-out;
              }
            `}</style>
            
            {/* Cluster 1 Nodes */}
            <circle cx="80" cy="40" r="5" className="fill-red-200 stroke-red-400" />
            <circle cx="100" cy="70" r="5" className="fill-red-200 stroke-red-400" />
            <circle cx="130" cy="30" r="5" className="fill-red-200 stroke-red-400" />
            <circle cx="140" cy="65" r="5" className="fill-red-200 stroke-red-400" />
            
            {/* Cluster 2 Nodes */}
            <circle cx="260" cy="110" r="5" className="fill-blue-200 stroke-blue-400" />
            <circle cx="280" cy="80" r="5" className="fill-blue-200 stroke-blue-400" />
            <circle cx="310" cy="120" r="5" className="fill-blue-200 stroke-blue-400" />
            <circle cx="330" cy="90" r="5" className="fill-blue-200 stroke-blue-400" />
            
            {/* Centroids */}
            <polygon points="110,45 115,55 105,55" className="centroid-red" strokeWidth="2" />
            <polygon points="295,95 300,105 290,105" className="centroid-blue" strokeWidth="2" />
            
            <text x="95" y="30" className="fill-red-600 font-mono text-[7px] font-bold">Cluster 1 Centroid</text>
            <text x="270" y="130" className="fill-blue-600 font-mono text-[7px] font-bold">Cluster 2 Centroid</text>
            
            <text x="135" y="145" className="fill-slate-400 font-mono text-[7px] font-bold uppercase tracking-wider">K-Means Grouping</text>
          </svg>
        );
      case 3: // Decision Trees
        return (
          <svg viewBox="0 0 400 160" className="w-full h-full fill-none" strokeWidth="1.5">
            <style>{`
              @keyframes activePath {
                0%, 100% { stroke-dashoffset: 30; stroke: #cbd5e1; }
                40% { stroke-dashoffset: 0; stroke: #3b82f6; }
                80% { stroke-dashoffset: 0; stroke: #10b981; }
              }
              .branch-left {
                stroke-dasharray: 10 20;
                animation: activePath 4s infinite linear;
              }
              @keyframes activeNode {
                0%, 100% { fill: #ffffff; stroke: #94a3b8; }
                20% { fill: #e0f2fe; stroke: #3b82f6; }
                60% { fill: #d1fae5; stroke: #10b981; }
              }
              .node-root { animation: activeNode 4s infinite 0s ease-in-out; }
              .node-left { animation: activeNode 4s infinite 1.3s ease-in-out; }
              .node-leaf-left { animation: activeNode 4s infinite 2.6s ease-in-out; }
            `}</style>
            
            {/* Tree Branch Lines */}
            <line x1="200" y1="30" x2="120" y2="80" className="branch-left" strokeWidth="2.5" />
            <line x1="200" y1="30" x2="280" y2="80" stroke="#cbd5e1" />
            <line x1="120" y1="80" x2="70" y2="130" className="branch-left" strokeWidth="2.5" />
            <line x1="120" y1="80" x2="170" y2="130" stroke="#cbd5e1" />
            
            {/* Root Node */}
            <circle cx="200" cy="30" r="12" className="node-root fill-white stroke-slate-400" />
            <text x="188" y="33" className="fill-slate-700 font-mono text-[8px] font-bold">X1 &lt; 5</text>
            
            {/* Level 1 Nodes */}
            <circle cx="120" cy="80" r="12" className="node-left fill-white stroke-slate-400" />
            <text x="108" y="83" className="fill-slate-700 font-mono text-[8px] font-bold">X2 &lt; 2</text>
            
            <circle cx="280" cy="80" r="12" className="fill-white stroke-slate-300" />
            <text x="265" y="83" className="fill-slate-450 font-mono text-[8px] font-bold">Class B</text>
            
            {/* Level 2 Leaves */}
            <circle cx="70" cy="130" r="12" className="node-leaf-left fill-white stroke-slate-400" />
            <text x="55" y="133" className="fill-slate-700 font-mono text-[8px] font-bold">Class A</text>
            
            <circle cx="170" cy="130" r="12" className="fill-white stroke-slate-300" />
            <text x="155" y="133" className="fill-slate-450 font-mono text-[8px] font-bold">Class B</text>
            
            <text x="125" y="45" className="fill-blue-500 font-mono text-[7px] font-bold">True</text>
            <text x="250" y="45" className="fill-slate-400 font-mono text-[7px] font-bold">False</text>
          </svg>
        );
      case 4: // Overfitting & Underfitting
        return (
          <svg viewBox="0 0 400 160" className="w-full h-full fill-none" strokeWidth="1.5">
            <style>{`
              @keyframes drawLines {
                0%, 100% { stroke-dashoffset: 400; }
                50% { stroke-dashoffset: 0; }
              }
              .clean-curve {
                stroke: #10b981;
                stroke-dasharray: 400;
                animation: drawLines 6s ease-in-out infinite;
              }
              .overfit-curve {
                stroke: #ef4444;
                stroke-dasharray: 450;
                animation: drawLines 6s ease-in-out infinite alternate;
              }
            `}</style>
            
            {/* Plot axes */}
            <path d="M 40 130 L 360 130 M 40 20 L 40 130" stroke="#cbd5e1" strokeWidth="1" />
            
            {/* Noisy training data dots */}
            <circle cx="70" cy="110" r="4" className="fill-slate-800 stroke-slate-900" />
            <circle cx="110" cy="80" r="4" className="fill-slate-800 stroke-slate-900" />
            <circle cx="160" cy="90" r="4" className="fill-slate-800 stroke-slate-900" />
            <circle cx="210" cy="50" r="4" className="fill-slate-800 stroke-slate-900" />
            <circle cx="270" cy="70" r="4" className="fill-slate-800 stroke-slate-900" />
            <circle cx="320" cy="30" r="4" className="fill-slate-800 stroke-slate-900" />
            
            {/* Clean quadratic trend line (Generalization) */}
            <path d="M 50 125 Q 160 95 340 30" className="clean-curve" strokeWidth="2.5" />
            
            {/* Erratic high degree overfitting line */}
            <path d="M 50 120 C 70 110 90 60 110 80 C 130 100 145 95 160 90 C 185 80 200 40 210 50 C 220 60 250 85 270 70 C 290 55 310 25 330 35" className="overfit-curve" strokeWidth="1.5" />
            
            <text x="210" y="115" className="fill-emerald-600 font-mono text-[7px] font-bold">Balanced Fit (Green)</text>
            <text x="210" y="125" className="fill-red-500 font-mono text-[7px] font-bold">Overfitting (Red - High Variance)</text>
          </svg>
        );
      case 5: // Model Evaluation
        return (
          <svg viewBox="0 0 400 160" className="w-full h-full fill-none" strokeWidth="1.5">
            <style>{`
              @keyframes slideDot {
                0%, 100% { transform: translate(0px, 0px); }
                50% { transform: translate(110px, -70px); }
              }
              .slider-dot {
                fill: #ec4899;
                stroke: #ffffff;
                stroke-width: 2;
                animation: slideDot 4s ease-in-out infinite;
              }
            `}</style>
            
            {/* Axes */}
            <path d="M 60 130 L 320 130 M 60 20 L 60 130" stroke="#cbd5e1" strokeWidth="1" />
            
            {/* Random guess diagonal line */}
            <line x1="60" y1="130" x2="300" y2="20" stroke="#cbd5e1" strokeDasharray="3 3" />
            
            {/* ROC Curve path */}
            <path id="rocCurve" d="M 60 130 Q 75 40 300 20" stroke="#3b82f6" strokeWidth="3" />
            
            {/* Animated threshold selection marker */}
            <circle cx="100" cy="90" r="6" className="slider-dot" />
            
            <text x="200" y="70" className="fill-blue-600 font-mono text-[8px] font-bold">ROC Curve (AUC = 0.91)</text>
            <text x="195" y="120" className="fill-slate-400 font-mono text-[7px]">False Positive Rate</text>
            <text x="25" y="75" className="fill-slate-400 font-mono text-[7px]" transform="rotate(-90 25 75)">True Positive Rate</text>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col relative">
      <div className="orb orb-blue w-80 h-80 -top-20 -left-20" />
      <div className="orb orb-purple w-80 h-80 bottom-0 -right-20" />

      {/* Header */}
      <div className="glass-light border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-semibold text-slate-800 tracking-wide">
            {classData?.title || 'ClassAI Room'}
          </span>
          <span className="text-xs text-slate-550">•</span>
          <span className="text-xs font-mono font-bold text-accent-600">
            Session: {classData?.sessionCode}
          </span>
          {studentInfo ? (
            <span className="bg-slate-100 text-slate-500 border border-slate-250 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
              STUDENT ROLE
            </span>
          ) : (
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
              TEACHER CONTROL
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Key config panel */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowKeyPanel(!showKeyPanel)}
              className={`p-2 rounded-lg transition-all duration-300 cursor-pointer flex items-center gap-1.5 border border-slate-200/40 text-xs font-semibold ${
                apiKey
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200/50' 
                  : 'bg-warning/10 text-warning hover:bg-warning/20 border-warning/20'
              }`}
            >
              <Key size={14} />
              <span className="hidden sm:inline">
                {apiKey ? 'API Connected' : 'Setup Gemini API Key'}
              </span>
            </button>
            
            {showKeyPanel && (
              <div className="absolute right-0 mt-2 w-80 p-4 rounded-xl glass border border-slate-200 shadow-2xl z-50 animate-slide-up" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5 font-display">
                  <Sparkles size={14} className="text-accent-500" />
                  Gemini API Configuration
                </h3>
                <p className="text-xs text-slate-550 mb-3 leading-relaxed">
                  Keys are stored locally in your browser.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block mb-1">
                      Gemini API Key
                    </label>
                    <input
                      type="password"
                      className="input-dark !py-2 !text-xs w-full px-2"
                      placeholder="Enter Gemini API Key..."
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block mb-1">
                      Unsplash Client ID (Optional)
                    </label>
                    <input
                      type="password"
                      className="input-dark !py-2 !text-xs w-full px-2"
                      placeholder="Unsplash Access Key"
                      value={unsplashInput}
                      onChange={(e) => setUnsplashInput(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowKeyPanel(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 border-none cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveSettings}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent-500 hover:bg-accent-600 text-white border-none cursor-pointer flex items-center gap-1"
                    >
                      {settingsSaved ? <Check size={12} /> : null}
                      {settingsSaved ? 'Saved!' : 'Save Credentials'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 px-4 sm:px-6 py-6 gap-6 relative z-10 overflow-hidden">
        {/* Left whiteboard area (8/12 cols) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          <div className="bg-white text-slate-900 border border-slate-200 shadow-xl rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 min-h-[500px]">
            {/* Whiteboard Grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {topicComplete ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 animate-slide-up">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200 mb-6">
                  <Check size={36} className="text-success" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">
                  Topic Lecture Complete!
                </h1>
                <p className="text-slate-550 text-sm max-w-sm mb-6 leading-relaxed">
                  Excellent work. A brief assessment based on this dynamic explanation will follow.
                </p>
                {studentInfo ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 font-mono">
                    <Clock size={14} className="text-accent-500 animate-pulse" />
                    WAITING FOR TEACHER TO LAUNCH QUIZ
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary flex items-center justify-center gap-2 text-sm !px-6 !py-2.5 cursor-pointer border-none"
                    >
                      Start Quiz
                      <ChevronRight size={15} />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 font-mono">
                      <Clock size={14} className="text-accent-500 animate-spin" />
                      AUTO TRANSITION IN {transitionCountdown}S
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between relative z-10">
                {/* Whiteboard Header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold font-mono">
                    <Lightbulb size={13} className="text-accent-500" />
                    LIVE WHITEBOARD
                  </div>
                  {isListening && (
                    <div className="flex items-center gap-1.5 text-xs text-error font-bold font-mono animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-error" />
                      TEACHER SPEECH ACTIVE
                    </div>
                  )}
                </div>

                {/* Whiteboard split layout */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch overflow-y-auto">
                  {/* Left Column (7 of 12) - Slides & text */}
                  <div className="md:col-span-7 flex flex-col justify-start">
                    <h2 className="text-slate-800 text-xl font-bold tracking-tight mb-4 flex items-center gap-2 border-b border-slate-50 pb-2 font-display">
                      <Sparkles className="w-5 h-5 text-accent-500 shrink-0" />
                      {boardState.title}
                    </h2>
                    
                    <ul className="space-y-3 flex-1">
                      {boardState.bulletPoints?.map((bp, bpIdx) => (
                        <li 
                          key={bpIdx}
                          className="flex items-start gap-2.5 text-slate-700 text-sm sm:text-base leading-relaxed animate-fade-in"
                        >
                          <span className="w-2 h-2 rounded-full bg-accent-500 shrink-0 mt-2" />
                          <span className="font-medium text-slate-700 leading-normal">{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Column (5 of 12) - Graphics, visual, video tabs */}
                  <div className="md:col-span-5 flex flex-col gap-3">
                    {/* Tab Navigation */}
                    <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50 gap-1 select-none">
                      <button
                        type="button"
                        onClick={() => setBoardState(prev => ({ ...prev, activeTab: 'schematic' }))}
                        className={`flex-1 py-1 text-[10px] font-bold uppercase font-mono tracking-wider rounded-md cursor-pointer border-none transition-all duration-200 ${
                          boardState.activeTab === 'schematic' 
                            ? 'bg-white text-slate-800 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600 bg-transparent'
                        }`}
                      >
                        Schematic
                      </button>
                      <button
                        type="button"
                        onClick={() => setBoardState(prev => ({ ...prev, activeTab: 'illustration' }))}
                        className={`flex-1 py-1 text-[10px] font-bold uppercase font-mono tracking-wider rounded-md cursor-pointer border-none transition-all duration-200 ${
                          boardState.activeTab === 'illustration' 
                            ? 'bg-white text-slate-800 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600 bg-transparent'
                        }`}
                      >
                        Illustration
                      </button>
                      <button
                        type="button"
                        disabled={!boardState.activeVideoId}
                        onClick={() => setBoardState(prev => ({ ...prev, activeTab: 'video' }))}
                        className={`flex-1 py-1 text-[10px] font-bold uppercase font-mono tracking-wider rounded-md cursor-pointer border-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                          boardState.activeTab === 'video' 
                            ? 'bg-white text-slate-800 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600 bg-transparent'
                        }`}
                      >
                        Video Reference
                      </button>
                    </div>

                    {/* Tab Contents */}
                    <div className="flex-1 border border-slate-200 rounded-xl p-3 bg-slate-50/50 shadow-inner flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                      {boardState.activeTab === 'schematic' && (
                        <div className="w-full flex-1 flex flex-col justify-between h-full">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center block mb-1">
                            Dynamic Vector Blueprint
                          </span>
                          <div className="w-full flex-1 flex items-center justify-center min-h-[100px]">
                            {renderWhiteboardSchematic()}
                          </div>
                          {boardState.visualDescription && (
                            <p className="text-[9px] text-slate-500 font-semibold font-mono mt-1 text-center leading-tight">
                              {boardState.visualDescription}
                            </p>
                          )}
                        </div>
                      )}

                      {boardState.activeTab === 'illustration' && (
                        <div className="w-full h-full flex-1 flex flex-col justify-between relative">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center block mb-1">
                            Unsplash Topic Photo
                          </span>
                          <div className="w-full flex-1 relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                            {unsplashLoading ? (
                              <div className="animate-pulse flex flex-col items-center">
                                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin mb-1" />
                                <span className="text-[8px] font-mono text-slate-500">Searching Photos...</span>
                              </div>
                            ) : unsplashImage ? (
                              <img src={unsplashImage} alt={boardState.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center text-slate-400">
                                <Image size={24} className="opacity-40 mb-1" />
                                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">No Image Available</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {boardState.activeTab === 'video' && (
                        <div className="w-full h-full flex-1 flex flex-col">
                          {boardState.activeVideoId && boardState.isVideoVisible ? (
                            <iframe
                              className="w-full flex-1 rounded-lg border border-slate-200"
                              src={`https://www.youtube.com/embed/${boardState.activeVideoId}?enablejsapi=1&autoplay=1`}
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                              <MonitorPlay size={28} className="opacity-30 mb-2" />
                              <span className="text-[9px] font-bold font-mono uppercase tracking-wider">Video Projection Stopped</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Marker board tray styling */}
                <div className="absolute bottom-0 inset-x-0 h-4 bg-slate-300 border-t border-slate-400 flex justify-center items-center shadow-inner select-none pointer-events-none rounded-b-2xl">
                  <div className="w-12 h-2 bg-blue-600 rounded-sm mx-1 shadow-sm opacity-90" />
                  <div className="w-12 h-2 bg-red-600 rounded-sm mx-1 shadow-sm opacity-90" />
                  <div className="w-12 h-2 bg-slate-800 rounded-sm mx-1 shadow-sm opacity-90" />
                  <div className="w-10 h-3 bg-slate-100 border border-slate-400 rounded-sm mx-4 shadow-sm flex items-center justify-center text-[5px] text-slate-400 font-bold tracking-tighter">ERASER</div>
                </div>
              </div>
            )}
          </div>

          {/* Live transcript log */}
          <div className="glass-light border border-slate-200/65 rounded-2xl p-4 shadow-md flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase font-mono">
                  Live Classroom Transcription Feed
                </h3>
              </div>
              <span className={`text-[9px] border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${
                isListening 
                  ? 'bg-error/10 border-error/20 text-error animate-pulse' 
                  : 'bg-slate-100 border-slate-250 text-slate-500'
              }`}>
                {isListening ? '🎤 Mic Streaming' : '🎤 Microphone Inactive'}
              </span>
            </div>

            <div className="max-h-24 min-h-[44px] overflow-y-auto pr-1 text-xs text-slate-650 leading-relaxed font-mono">
              {cumulativeTranscript || interimTranscript ? (
                <span>
                  {cumulativeTranscript}
                  {interimTranscript && (
                    <span className="text-accent-500 font-semibold animate-pulse">{interimTranscript}</span>
                  )}
                </span>
              ) : (
                <span className="text-slate-400 italic">
                  {studentInfo 
                    ? "Awaiting teacher's live explanation..." 
                    : "No transcription captured yet. Toggle your microphone below to start speaking!"}
                </span>
              )}
            </div>

            {/* Teacher manual simulation helper */}
            {!studentInfo && (
              <div className="flex gap-2 items-center border-t border-slate-100/40 pt-2 flex-wrap">
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={simulationText}
                    onChange={(e) => setSimulationText(e.target.value)}
                    placeholder="Simulate speech for testing... (e.g. 'A neuron calculates weighted sums.')"
                    onKeyDown={(e) => e.key === 'Enter' && handleSimulateSpeech()}
                    className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 bg-white/50 text-xs placeholder:text-slate-400 outline-none text-slate-850"
                  />
                  <button
                    type="button"
                    onClick={handleSimulateSpeech}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                  >
                    Simulate Speech
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Teacher YouTube Search & Action panel */}
          {!studentInfo && !topicComplete && (
            <div className="glass-light border border-slate-200/65 rounded-2xl p-5 shadow-md flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100/60 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <Video size={16} className="text-accent-500" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                    Teacher Reference YouTube Panel
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-semibold font-mono">AI Suggestion:</span>
                  <span 
                    onClick={() => handleYoutubeSearch(boardState.youtubeSearchQuery)}
                    className="text-[10px] bg-accent-50 border border-accent-100 text-accent-700 font-bold px-2 py-0.5 rounded-md cursor-pointer hover:bg-accent-100 transition-all font-mono"
                  >
                    {boardState.youtubeSearchQuery || 'Search Query'}
                  </span>
                </div>
              </div>

              {/* URL loading vs normal search */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search YouTube reference videos..."
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none text-slate-850"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleYoutubeSearch(e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="md:col-span-4 flex gap-2">
                  <input
                    type="text"
                    value={customVideoQuery}
                    onChange={(e) => setCustomVideoQuery(e.target.value)}
                    placeholder="YouTube URL or Video ID"
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none text-slate-850"
                  />
                  <button
                    type="button"
                    onClick={loadCustomVideo}
                    className="px-3 py-2 text-xs font-bold bg-accent-500 hover:bg-accent-600 text-white rounded-xl cursor-pointer border-none shadow-sm flex items-center gap-1"
                  >
                    <PlusCircle size={13} />
                    Load
                  </button>
                </div>
              </div>

              {/* Video Search Results horizontal scroller */}
              <div className="overflow-x-auto pb-1">
                {youtubeSearching ? (
                  <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                    <div className="w-4 h-4 border-2 border-slate-200 border-t-accent-500 rounded-full animate-spin" />
                    <span className="text-xs font-mono">Searching YouTube library...</span>
                  </div>
                ) : youtubeResults.length > 0 ? (
                  <div className="flex gap-4 min-w-max">
                    {youtubeResults.map((video) => (
                      <div 
                        key={video.videoId}
                        onClick={() => selectVideo(video.videoId)}
                        className={`w-52 p-2 rounded-xl border flex flex-col gap-2 hover:scale-[1.02] hover:shadow-md cursor-pointer transition-all duration-200 ${
                          boardState.activeVideoId === video.videoId 
                            ? 'bg-accent-500/5 border-accent-500/40 shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-slate-350'
                        }`}
                      >
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="w-full h-24 object-cover rounded-lg border border-slate-100" 
                        />
                        <div className="flex flex-col gap-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-850 truncate leading-tight">
                            {video.title}
                          </p>
                          <p className="text-[8px] font-semibold text-slate-400 font-mono truncate">
                            {video.author}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs font-semibold font-mono">
                    No reference videos loaded. Try searching or enter a query above.
                  </div>
                )}
              </div>

              {/* Dynamic board toggles */}
              {boardState.activeVideoId && (
                <div className="flex gap-3 justify-end pt-2 border-t border-slate-100/40">
                  <button
                    type="button"
                    onClick={() => {
                      setBoardState(prev => ({ ...prev, activeTab: prev.activeTab === 'video' ? 'schematic' : 'video' }));
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border ${
                      boardState.activeTab === 'video' 
                        ? 'bg-cyber-purple/10 border-cyber-purple/20 text-cyber-purple' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {boardState.activeTab === 'video' ? 'Hide Video Tab' : 'Show Video Tab'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBoardState(prev => ({ ...prev, isVideoVisible: !prev.isVideoVisible }));
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border ${
                      boardState.isVideoVisible 
                        ? 'bg-error/10 border-error/20 text-error' 
                        : 'bg-success/15 border-success/30 text-success'
                    }`}
                  >
                    {boardState.isVideoVisible ? 'Stop Projection' : 'Project Selected Video'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right syllabus column (4/12 cols) */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="glass p-5 flex-1 flex flex-col justify-between min-h-[400px] border border-slate-200/80 shadow-xl">
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-200/60 mb-4">
                <BookOpen size={16} className="text-cyber-purple" />
                <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                  Class Syllabus
                </h3>
              </div>

              <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                {classData?.topics?.map((topic, idx) => {
                  const isActive = idx === currentTopicIndex;
                  const isCompleted = idx < currentTopicIndex;
                  
                  let cardStyle = 'border-slate-200/60 bg-white/40 shadow-sm';
                  let statusText = 'Upcoming';
                  let statusColor = 'text-slate-500 border-slate-200 bg-slate-50';
                  
                  if (isActive) {
                    cardStyle = 'border-accent-500/40 bg-accent-500/5 glow-accent';
                    statusText = 'Currently Teaching';
                    statusColor = 'text-accent-600 border-accent-500/20 bg-accent-500/10 animate-pulse';
                  } else if (isCompleted) {
                    cardStyle = 'border-success/20 bg-success/5 opacity-80';
                    statusText = 'Completed';
                    statusColor = 'text-success border-success/20 bg-success/10';
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all duration-300 ${cardStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                        isActive 
                          ? 'bg-accent-500 text-white' 
                          : isCompleted 
                          ? 'bg-success/20 text-success' 
                          : 'bg-navy-800 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold leading-tight truncate ${isActive ? 'text-slate-800 font-bold' : 'text-slate-655'}`}>
                          {topic}
                        </p>
                        <span className={`inline-block border px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono mt-1.5 ${statusColor}`}>
                          {statusText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls bar */}
      <div className="glass-light border-t border-slate-200/80 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 z-20 shadow-md">
        <div className="flex items-center gap-2.5 text-xs text-slate-655 font-medium">
          <BookOpen size={14} className="text-accent-500" />
          <span>Topic {currentTopicIndex + 1} of {totalTopics}:</span>
          <span className="text-slate-800 font-bold">{topicName}</span>
        </div>
        
        {/* Playback actions / Microphone active state */}
        <div className="flex items-center gap-4">
          {!studentInfo && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleListening}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm border transition-all duration-300 ${
                  isListening 
                    ? 'bg-error text-white hover:bg-error/90 border-error' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff size={14} />
                    Mute Microphone
                  </>
                ) : (
                  <>
                    <Mic size={14} />
                    Start Live Lecture
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => generateBoardUpdate(speechTranscript)}
                disabled={generatingBoard || !speechTranscript}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                {generatingBoard ? 'Syncing...' : 'Update Board Now'}
              </button>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoGenerate}
                  onChange={(e) => setAutoGenerate(e.target.checked)}
                  className="rounded border-slate-300 text-accent-500 focus:ring-accent-400"
                />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Auto Update</span>
              </label>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold shadow-inner ${
                timeLeft < 60 
                  ? 'bg-error/20 text-error animate-pulse' 
                  : 'bg-accent-50 border border-accent-100 text-accent-600'
              }`}>
                <Clock size={14} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {studentInfo && (
              <div className="flex items-center gap-2 border border-slate-200/80 bg-white/50 rounded-xl px-3 py-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setIsMuted(prev => !prev)}
                  className="text-slate-500 hover:text-slate-700 bg-transparent border-none cursor-pointer p-0 flex items-center justify-center outline-none"
                  title={isMuted ? 'Unmute voice' : 'Mute voice'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={14} className="text-error" />
                  ) : (
                    <Volume2 size={14} className="text-accent-500" />
                  )}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    if (isMuted && val > 0) {
                      setIsMuted(false);
                    }
                  }}
                  className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent-500 outline-none"
                  style={{ verticalAlign: 'middle' }}
                />
                
                <span className="text-[10px] font-mono font-bold text-slate-500 w-8 text-right select-none">
                  {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
                </span>
              </div>
            )}

            {!studentInfo && (
              <button
                type="button"
                onClick={handleTopicComplete}
                disabled={loading || topicComplete}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-650 border border-slate-250 hover:bg-slate-200 hover:text-slate-800 transition-all duration-200 disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                Complete Lecture
                <ChevronRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
