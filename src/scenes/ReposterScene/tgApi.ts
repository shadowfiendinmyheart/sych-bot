import axios from "axios";

interface TgPost {
  text?: string;
  photos: string[];
}

export const tgRequest = async (method: string, body: object) => {
  const tgResponse = await axios.post(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/${method}`,
    body
  );
  if (!tgResponse.data.ok) {
    console.log("tgRequest is not ok", tgResponse.data);
    return;
  }
  return tgResponse.data;
};

export const makePostToTg = async (post: TgPost) => {
  if (post.photos?.length === 0) return;
  const photos = post.photos.map((photo, index) => {
    const media = {
      type: "photo",
      media: photo,
    };
    return index ? media : { caption: post.text, ...media };
  });
  const tgResponse = await axios.post(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMediaGroup`,
    {
      chat_id: process.env.TG_GROUP_ID,
      caption: post.text,
      media: photos,
    }
  );
  return tgResponse;
};

export const addingPostText = (text: string, postId: number) => {
  return `${text} hello world </br> link: <a href="https://vk.com/your_sychevalnya?w=wall-33326094_${postId}">Link</a>`;
};
