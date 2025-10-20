import spinner from '../../assets/spinner.gif';

function Loading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-950">
      <div className="bg-slate-900 text-gray-100 rounded-2xl shadow-elev-2 border border-white/10 p-8 sm:p-7 flex flex-col items-center gap-4 sm:gap-3">
        <img
          src={spinner}
          alt="טוען..."
          className="w-20 h-20 sm:w-16 sm:h-16 opacity-90"
        />
        <p className="text-gray-100 font-semibold text-lg sm:text-base animate-pulse">
          טוען...
        </p>
      </div>
    </div>
  );
}

export default Loading;