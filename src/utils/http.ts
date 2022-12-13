import fetch from 'cross-fetch';

const http = async (
  url: string,
  method = 'GET',
  body?: object | string | null,
  headers?: object | null
) => {
  try {
    if (body) {
      body = JSON.stringify(body);
    }

    const res: Response = await fetch(url, {
      method: method,
      body: body,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'same-origin',
    });

    const data = await res.json();

    const answer = {
      status: res.status,
      ...data,
    };
    return answer;
  } catch (e) {
    console.log(e);
  }
};

export default http;
