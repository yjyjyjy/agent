import { useState } from 'react';
import { useToasts } from 'react-toast-notifications';

export default function JoinUs() {
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const { addToast } = useToasts();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');

    if (!email || !content) {
      setStatus('Email and content cannot be empty.');
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      setStatus('Please enter a valid email address.');
      return;
    }

    const response = await fetch('/api/sendEmail/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: email,
        subject: 'New Message from Join Us Form',
        content: content
      })
    });

    const result = await response.json();

    if (result.success) {
      addToast('Email sent successfully!', { appearance: 'success' })
      setStatus('Email sent successfully!');
      // resets the form
      setEmail('');
      setContent('');
    } else {
      setStatus('Failed to send email. Please try again.');
    }
  };

  return <div className="hero min-h-screen bg-base-200">
    <div className="hero-content flex-col ">
      <div className="text-center p-4">
        <h1 className="text-5xl font-bold">Want to create a mini you for your fans?🚀</h1>
        <p className="py-4">Leave us a message!</p>

      </div>

      <div className="card flex-shrink-0 w-full mt-3 justfy-center max-w-sm shadow-2xl bg-base-100">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input type="email" placeholder="email" className="input input-bordered" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Content</span>
              </label>
              <textarea className="textarea textarea-primary" placeholder="Write your message..." value={content} onChange={(e) => setContent(e.target.value)} required ></textarea>
            </div>
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary">Send</button>
            </div>
          </form>
          {status && <p>{status}</p>}
        </div>
      </div>

      <div className="card lg:text-left card-side bg-base-100 shadow-xl mt-10">
        <div className="card-body">
          <div className="py-6 text-left">
            <p className="py-4 font-semibold card-title">Why waterbear.one? </p>
            <ul className="list-inside space-y-2">
              <li>🎨 <span className="font-normal">Create with Ease: With our state-of-the-art AI Image Generation tools, transform your ideas into stunning, photo-realistic content in minutes, not days.</span></li>
              <li>💸 <span className="font-normal">Monetize Without Limits: Experience a platform that welcomes AI content, empowering you to earn at a level comparable to human influencers.</span></li>
              <li>💬 <span className="font-normal">Engage Your Audience: Offer personalized chats and immersive experiences using AI, cultivating connections with fans like never before.</span></li>
              <li>😌 <span className="font-normal">Avoid Burnout: Enjoy a satisfying and financially rewarding career without the constant pressure to produce. Our AI tools work with you, not against you.</span></li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  </div>

}