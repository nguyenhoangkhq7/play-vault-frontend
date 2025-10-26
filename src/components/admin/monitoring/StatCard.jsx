export default function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-500 
                    p-6 rounded-2xl shadow-lg flex items-center justify-between 
                    text-white transition-all duration-300">
      <div>
        <h3 className="font-semibold text-purple-200">{title}</h3>
        <p className="text-4xl font-bold mt-2">{value}</p>
      </div>
      <Icon className="h-12 w-12 text-white/50" />
    </div>
  );
}
