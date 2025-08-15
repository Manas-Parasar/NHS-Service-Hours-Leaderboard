export default function WhiteCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
}