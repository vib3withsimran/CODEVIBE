import React from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ankit Parmar",
    role: "Frontend Learner",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
    feedback:
      "This platform helped me understand React basics easily and practice coding without any setup.",
    rating: 5,
  },
  {
    name: "Sanjana Vanga",
    role: "Beginner Programmer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    feedback:
      "Great structured learning experience for beginners. The lessons are simple and interactive.",
    rating: 5,
  },
  {
    name: "Suraj Kumar",
    role: "Web Development Student",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop",
    feedback:
      "I really liked the instant feedback system and progress tracking dashboard.",
    rating: 5,
  },
  {
    name: "Millie Rathore",
    role: "UX/UI Designer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    feedback:
      "The visual feedback loop is incredibly helpful. I can see my designs come to life instantly.",
    rating: 5,
  },
  {
    name: "Rohan Gupta",
    role: "Backend Developer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    feedback:
      "CodeVibe's seamless backend integration exercises have massively accelerated my learning curve.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Full Stack Engineer",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop",
    feedback:
      "I love how everything is tightly integrated. Building full-stack apps here is a breeze.",
    rating: 4,
  },
];

const Testimonials = () => {
  // Duplicate for smooth infinite scroll
  const scrollTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="testimonials">
      <h2>What Learners Say</h2>
      <p className="testimonial-subtitle">
        Feedback from learners using CodeVibe to improve their coding skills.
      </p>

      <div className="testimonials-wrapper">
        <div className="testimonial-container">
          {scrollTestimonials.map((item, index) => (
            <div className="testimonial-card" key={index}>
              <div className="quote-icon">
                <Quote size={32} strokeWidth={1.5} />
              </div>
              <div className="testimonial-rating">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#ffc107" color="#ffc107" />
                ))}
              </div>

              <p className="testimonial-feedback">"{item.feedback}"</p>

              <div className="testimonial-user">
                <img src={item.avatar} alt={item.name} className="testimonial-avatar" />
                <div className="testimonial-user-info">
                  <h3>{item.name}</h3>
                  <span>{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;