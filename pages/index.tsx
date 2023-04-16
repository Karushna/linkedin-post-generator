import Head from "next/head";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Post } from "@/components/Post";
import { Ranking } from "@/components/Ranking";
import { rank } from "@/lib/linkedin-algorithm";
import { Toaster, toast } from "react-hot-toast";
import LoadingDots from "@/components/LoadingDots";
import DropDown, { VibeType } from "@/components/DropDown";
import Footer from "@/components/Footer";


export default function Home() {
  const [loading, setLoading] = useState(false);
  const [optimizedPost, setOptimizedPost] = useState<string>("");
  const [ranking, setRanking] = useState<RankResponse>({
    score: 0,
    validations: [],
  });
  const [post, setPost] = useState<string>("");
  const [media, setMedia] = useState<boolean>(false);
  const [vibe, setVibe] = useState<VibeType>("Story");
  // const [hasVideo, setHasVideo] = useState<boolean>(false);
  // const [hasCarousel, setHasCarousel] = useState<boolean>(false);

  useEffect(() => {
    const rankResponse = rank(post, media);
    setRanking(rankResponse);
  }, [post, media]);

  // prompt for optimizing post

  // add more vibes as needed
  const handlePrompt = () => {
    let prompt;
    switch (vibe) {
      case "Story":
        prompt = `Generate post using this prompt, based on ${post}. You are a LinkedinGPT, a large language model that generates viral posts for Linkedin. You are given a prompt of a post and must generate a post that is more likely to be liked and reposted than the original post.
The Linkedin algorithm contains boosts and demotions based on what you are writing. Positive boosts are:

- in each post add emoji
- 200 characters in sentence maximum
- Start each sentecnce from new line and ad numbers in first 2 lines
- add 3 hashtags which 2 are generic and one very specific (at the end) Tags relate to post theme
- add a question at the end of the post to start a discussion. Before the hashtags
- first two lines should be catchy
- Dont add links - links are not good.
- If post copied in the field contain some numbers keep them the same.

Add idea about which image or visual can be added at the end of the post (this text is not counted as part of post)
${post}
---
Generated post length must be more than 800-1400 characters
---
Between each line must be a space
---
Keep all mentions of people in there
---
Start the firs line from smth like: I did smth, In year, I do, Tired of, Sometimes it is just, A path toward, Because this is not,I've been struggling,  (change the begginign depends on the context )
---
Add emoji if it fits
---
It should be  a story`;
        break;
      case "Crisp":
        prompt = `Generate post using this prompt, based on ${post}. You are a LinkedinGPT, a large language model that generates viral posts for Linkedin. You are given a prompt of a post and must generate a post that is more likely to be liked and reposted than the original post.
The Linkedin algorithm contains boosts and demotions based on what you are writing. If person select this ${vibe}, make sure the generated ${post} must follow these conditions and be short, crips and inspiring:
- Post length must be no more than 500 characters. 
- Each sentence length is less than 50 characters. 
- First sentences must start with smth like that : I've spent 5 months, 10 step plan, I made 10000 In, Last January, this January, I was on .. , I created 1000 of, how to get 1000 followers, how to do 1000 of, 10 lessons took me,  15 reasons, 5 days ago, 3 shocking steps, my strategy for  2023, over the past 10 years. (change numbers, generate always new numbers, generate always new beggining). Next sentences should not include numbers and these formulations.  
- If post copied in the field contain some numbers keep them the same.
- Next sentences should be generated, should not include numbers.
---
Each sentence from new line 
---
Add space between each abstract.
---
Show only generated post`;

        break;
      case "List":
        prompt = `Generate post using this prompt, based on ${post}. You are a LinkedinGPT, a large language model that generates viral posts for Linkedin. You are given a prompt of a post and must generate a post that is more likely to be liked and reposted than the original post.
The Linkedin algorithm contains boosts and demotions based on what you are writing. If person select this ${vibe}, make sure the generated post must follow these conditions and be super short sentences from 1-2 words :
- Post length must be no more than one hundred characters. 
- Each sentence length is less than twenty characters. 
- Add only one list 
- Only First sentences must start with smth like that: There are 2 types of, 1 big mistake make, Most people think, What worked in the past might not, When you, avoid, 5 quick tips, Most companies, If you don't plan to, Behind every bad, Before asking (change numbers, generate always new numbers, generate always new beggining). 
- If post copied in the field contain some numbers keep them the same.
- Next sentences should be generated, and conain list, each list point start from number
---
Each sentence from new line 
---
Add space between each abstract.
---`;

        break;
      case "Unpopular opinion":
        prompt = `Generate post using this prompt, based on ${post}. You are a LinkedinGPT, a large language model that generates viral posts for Linkedin. You are given a prompt of a post and must generate a post that is more likely to be liked and reposted than the original post.
        The Linkedin algorithm contains boosts and demotions based on what you are writing. If person select this ${vibe}, make sure the generated post must follow these conditions and create an unpopular opinion about the topic:
        - Post length must be less than 200 characters. 
        - Post must contain no more tha 3 sentences 
        - First sentence must start with: Unpopular opinion: 
        ---
        Add space between each abstract.`;
        break;
      case "Case Study":
        prompt = `Generate post using this prompt, based on ${post}. person insert You are a LinkedinGPT, a large language model that generates viral posts for Linkedin. You are given a prompt of a post and must generate a post that is more likely to be liked and reposted than the original post.
The Linkedin algorithm contains boosts and demotions based on what you are writing. If person select this ${vibe}, make sure the generated post must follow these conditions and be fullfilling and rigorous and realate to post typed:
- Post must relate to what initially is inserted  
- Post length must be no more than 1000 characters. 
- Each sentence length is less than 200 characters. 
- First sentence must start with smth like that, or similar text to one: Pro-tip, These simeple expereiments, Here is one of my biggest learnings from this year, Inside, Being ... does not mean, Earlier this year , This might be the hottest (use similar words) 
- If post copied in the field contain some numbers keep them the same.
- Next sentences should be generated, and contain list, rigorous list, each list point start from emoji
---
Provide the idea for graphics, image, sceme which will fuel these case study post at the end in the brackets
---s
Add space between each abstract.`;
        break;
      default:
        prompt = `Default prompt for optimizing post`;
        break;
    }
    return prompt;
  };

  // function to send post to OpenAI and get response
  const optimizePost = async (e: any) => {
    e.preventDefault();
    setOptimizedPost("");
    setLoading(true)
    const prompt = handlePrompt();
    const response = await fetch("/api/optimize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),

    });


    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      const formattedChunk = chunkValue.replace(/\n/g, "<br>");
      setOptimizedPost((prev) => prev + formattedChunk);
    }
    setLoading(false);
  };
  return (
    <>
      <Head>
        <title>LinkedIn Post Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="👩‍💼" />
        <meta
          name="description"
          content="See how your post performs against Linkedin alghoritm and generate better post with AI."
        />
        <meta
          property="og:site_name"
          content="linkedin-booster.vercel.app"
        />
        <meta
          property="og:description"
          content="See how your post performs against Linkedin alghoritm and generate better post with AI."
        />
        <meta
          property="og:title"
          content="Linkedin Post Booster with ChatGPT"
        />
        <meta name="linkedin:card" content="summary_large_image" />
        <meta
          name="linkedin:title"
          content="Real Linkedin Algorithm Rank Validator"
        />
        <meta
          name="linkedin:description"
          content="See how your post performs against the official open-source Twitter algorithm."
        />
        {/* <meta
          property="og:image"
          content="https://real-twitter-algorithm.vercel.app/og-image.png"
        />
        <meta
          name="twitter:image"
          content="https://real-twitter-algorithm.vercel.app/og-image.png"
        /> */}

      </Head>

      <main>
        <nav className="bg-blue-900 text-white ">
          <div className="px-5">
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center h-16 ">
                <div className="flex items-center text-base ">
                  <a target="_blank"
                    href="https://www.linkedin.com/in/iuliia-shnai/"
                    rel="noreferrer"
                    className="text-white flex max-w-fit items-center justify-center space-x-2 text-xl"
                  >
                    <p>👩‍💼</p>
                  </a>
                </div>
                {/* <div>
                  <ul className="flex">
                    <li className="ml-8">
                      <a
                        target="_blank"
                        href="https://github.com/mfts/twitter-algorithm-ai"
                        rel="noreferrer"
                        className="text-white flex max-w-fit items-center justify-center space-x-2"
                      >
                        <Github />
                        <p>Star on GitHub</p>
                      </a>
                    </li>
                  </ul>
                </div> */}
              </div>
            </div>
          </div>
        </nav>
        <section className="py-10 lg:py-20 ">
          {/* bg-[url('/image1.svg')] */}
          <div className="px-4">
            <div className="max-w-5xl mx-auto">
              <div className="w-full mx-auto">
                <h1 className="text-6xl text-center font-bold pb-1 text-slate-900">

                  Linkedin Power Post 🚀
                </h1>
                <p className="mt-3 mb-10 text-center">
                  See how your post performs and generate a better one with AI. Time to go viral. <br />

                </p>
                <div className="flex flex-col md:flex-row w-full md:space-x-20">
                  <div className="flex md:w-1/2 flex-col">
                    <h2 className="text-xl font-bold">
                      Your Ranking
                    </h2>
                    <div className="pt-1">
                      <Ranking ranking={ranking} />
                    </div>

                    <div className="w-full my-1 mx-auto">
                      <Post
                        post={post}
                        setPost={setPost}
                        media={media}
                        setMedia={setMedia}
                      />
                    </div>

                    <div className="flex mb-5 items-center space-x-3">


                    </div>
                    <div className="block">
                      <DropDown vibe={vibe} setVibe={setVibe} />
                    </div>
                    <div className="my-4">
                      <button
                        disabled={loading}
                        onClick={(e) => optimizePost(e)}
                        className="bg-blue-800 font-medium rounded-md w-full text-white px-4 py-2 hover:bg-blue-600 disabled:bg-blue-800"
                      >
                        {loading && <LoadingDots color="white" style="large" />}
                        {!loading && `Generate new post `}
                      </button>
                    </div>

                  </div>
                  <div className="flex md:w-1/2 md:flex-col">
                    <Toaster
                      position="top-right"
                      reverseOrder={false}
                      toastOptions={{ duration: 2000 }}
                    />
                    {optimizedPost && (
                      <div className="my-1">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                          <h2 className="text-xl font-bold">
                            Your Generated Post
                          </h2>
                        </div>
                        <div className="max-w-2xl my-4 mx-auto">
                          <div
                            className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                            onClick={() => {
                              navigator.clipboard.write([
                                new ClipboardItem({
                                  "text/html": new Blob([optimizedPost], { type: "text/html" }),
                                }),
                              ]);
                              toast("Post copied to clipboard", {
                                icon: "📋",
                              });
                            }}
                            key={optimizedPost}
                          >
                            <p className="text-black-700" dangerouslySetInnerHTML={{ __html: optimizedPost }} />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="max-w-5xl mx-auto">
          <Footer />
        </div>
      </main>
    </>
  );
}
