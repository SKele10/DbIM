import { navigation } from "../constants";
import dbim from "/dbim.png";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const { pathname } = useLocation();
  return (
    <div className="static w-full font-montserrat top-0 bg-primary z-50">
      <div className="flex items-center px-5 py-5">
        <Link
          className="flex justify-center items-center font-oswald w-[12rem] text-white font-bold text-2xl hover:text-action"
          to="/"
        >
          <img src={dbim} width={48} height={40} alt="DbIM" />
          DbIM
        </Link>
        <nav
          className={`flex top-[5rem] left-0 right-0 bottom-0 static mx-auto`}
        >
          <div className="relative z-2 flex items-center justify-center m-auto flex-row">
            {navigation.map((item) => (
              <Link
                key={item.id}
                to={item.url}
                className={`block relative font-semibold text-lg uppercase transition-colors px-6 ${
                  pathname?.includes(item.name)
                    ? "z-10 text-action"
                    : "text-white"
                } hover:text-action`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
