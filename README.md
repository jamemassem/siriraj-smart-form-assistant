
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/633c8bd8-18fe-4b60-a463-a8d14c3a7a40

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/633c8bd8-18fe-4b60-a463-a8d14c3a7a40) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Development Setup

### วิธีตั้ง .env ใน Local Development

1. สร้างไฟล์ `.env` ใน root directory
2. เพิ่ม OpenRouter API Key:
   ```
   VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxx
   ```

### วิธีสร้าง Domain-scoped key บน openrouter.ai

1. ไปที่ [OpenRouter.ai](https://openrouter.ai/)
2. สร้างบัญชีและเข้าสู่ระบบ
3. ไปที่ Settings > API Keys
4. สร้าง API Key ใหม่ พร้อมกำหนด domain restrictions
5. คัดลอก key มาใส่ในไฟล์ .env

### โหมด Development vs Production

- **Development**: หากไม่มี API key ใน .env ระบบจะแสดง modal ให้กรอก key และเก็บใน localStorage
- **Production**: ใช้ API key จาก environment variables เท่านั้น ไม่แสดง modal

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/633c8bd8-18fe-4b60-a463-a8d14c3a7a40) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
