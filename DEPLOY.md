# Deploy AI Brand Positioning Helper

This app is ready for Vercel deployment once you replace the placeholder Kimi environment value.

## 1. Create the required key

### Kimi

1. Open [Kimi API Platform](https://platform.kimi.ai/).
2. Create or open your API key.
3. Copy the key value.

## 2. Configure local development

1. Open [.env.local](/Users/jensen/Documents/验证/.env.local).
2. Replace every placeholder value:

```env
KIMI_API_KEY=your_real_kimi_key
KIMI_MODEL=kimi-k2.6
KIMI_BASE_URL=https://api.moonshot.cn/v1
```

3. Restart the dev server after changing env values:

```bash
npm run dev
```

## 3. Deploy to Vercel

1. Push this repo to GitHub, GitLab, or Bitbucket if it is not already there.
2. Open [Vercel](https://vercel.com/new).
3. Click **Import** on your repository.
4. Confirm the framework is **Next.js**.
5. Open the **Environment Variables** section before deploying.
6. Add these variables one by one:
   - `KIMI_API_KEY`
   - `KIMI_MODEL`
   - `KIMI_BASE_URL`
7. For each variable, paste the same production value you used locally.
8. Click **Deploy**.

## 4. Verify the deployed app

1. Open the Vercel deployment URL.
2. Confirm the warning banner about missing configuration is gone, or that demo mode works if you intentionally left the key empty.
3. Generate a sample positioning result.
4. Test `复制结果` and `下载分享图`.

## 5. Troubleshooting

- If real Kimi generation does not work, `KIMI_API_KEY` is still missing or still set to the placeholder value.
- If Vercel deploys but the app still shows setup warnings, go to **Project Settings** -> **Environment Variables**, update the values, then redeploy.
