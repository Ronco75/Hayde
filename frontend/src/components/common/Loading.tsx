import spinner from '../../assets/spinner.gif';

function Loading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
        <img
          src={spinner}
          alt="טוען..."
          className="w-20 h-20 opacity-90"
        />
        <p className="text-purple-900 font-semibold text-lg animate-pulse">
          טוען...
        </p>
      </div>
    </div>
  );
}

export default Loading;