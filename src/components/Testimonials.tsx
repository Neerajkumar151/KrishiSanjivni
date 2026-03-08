import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'James Patterson',
    role: 'Corn Farmer, Iowa',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    content: 'The soil testing service helped me increase my yield by 35% in just one season. The AI chatbot is like having an agronomist on call 24/7.',
    rating: 5
  },
  {
    name: 'Maria Gonzalez',
    role: 'Organic Farm Owner, California',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    content: 'The community forum connected me with experts who helped me transition to organic farming. The warehouse solutions saved us thousands in storage costs.',
    rating: 5
  },
  {
    name: 'Robert Chen',
    role: 'Wheat Grower, Kansas',
    image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
    content: 'I was skeptical at first, but the crop testing caught a disease early that could have wiped out my entire harvest. This platform paid for itself ten times over.',
    rating: 5
  },
  {
    name: 'Sarah Williams',
    role: 'Vegetable Farm, Oregon',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    content: 'The equipment rental program gave me access to machinery I could never afford to buy. The analytics dashboard helps me make data-driven decisions every day.',
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-green-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Stories from the Field
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real farmers, real results. See how our community is transforming agriculture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-bl-full opacity-50"></div>

              <div className="relative">
                <Quote className="w-10 h-10 text-green-600 mb-4 opacity-50" />

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 text-lg mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    loading="lazy"
                    className="w-16 h-16 rounded-full object-cover shadow-md"
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-green-600 text-sm font-medium">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600 text-lg mb-6">
            Join over 10,000 satisfied farmers who trust our platform
          </p>
          <div className="flex justify-center items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 border-2 border-white shadow-md"
                ></div>
              ))}
            </div>
            <span className="text-gray-600 font-medium ml-2">+10,000 farmers</span>
          </div>
        </div>
      </div>
    </section>
  );
}
