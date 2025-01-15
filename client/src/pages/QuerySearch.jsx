import { RadioButton } from "primereact/radiobutton";
import { useLazyQuery } from "@apollo/client";
import { Calendar } from "primereact/calendar";
import { useCallback, useState } from "react";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import queries from "../services/queries";
import { Dropdown } from "primereact/dropdown";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import MusicGenre from "../services/enums";
import moment from "moment";
import { Link } from "react-router-dom";

const QuerySearch = () => {
  const [searchType, setSearchType] = useState(1);
  const [genre, setGenre] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [years, setYears] = useState({
    min: new Date(1900, 0, 1),
    max: new Date(moment().year(), 0, 1),
  });
  const genreLookup = [];
  Object.keys(MusicGenre).map((genre) =>
    genreLookup.push({
      id: genre,
      title: MusicGenre[genre],
    })
  );
  const [
    fetchAlbums,
    { loading: albumsLoading, error: albumsError, data: albums },
  ] = useLazyQuery(queries.ALBUMS_BY_GENRE, {
    fetchPolicy: "cache-and-network",
  });
  const [
    fetchCompanies,
    { loading: companiesLoading, error: companiesError, data: companies },
  ] = useLazyQuery(queries.COMPANY_BY_FOUNDED_YEAR, {
    fetchPolicy: "cache-and-network",
  });
  const [
    fetchArtists,
    { loading: artistsLoading, error: artistsError, data: artists },
  ] = useLazyQuery(queries.SEARCH_ARTIST_BY_NAME, {
    fetchPolicy: "cache-and-network",
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    switch (searchType) {
      case 1:
        fetchAlbums({ variables: { genre: genre.id } });
        break;
      case 2:
        fetchCompanies({
          variables: {
            min: years.min.getFullYear(),
            max: years.max.getFullYear(),
          },
        });
        break;
      case 3:
        fetchArtists({ variables: { searchTerm: searchText } });
        break;
      default:
        break;
    }
  };
  const handleSearchType = useCallback((value) => {
    setSearchType(value);
  }, []);

  const handleDateChange = useCallback(
    (e, field) => {
      setYears({ ...years, [field]: e.value });
    },
    [years]
  );

  const getInputHTML = useCallback(() => {
    switch (searchType) {
      case 1:
        return (
          <FloatLabel>
            <Dropdown
              id="genre"
              value={genre}
              options={genreLookup}
              onChange={(e) => setGenre(e.target.value)}
              optionLabel="title"
              className="w-full px-3  border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <label
              htmlFor="genre"
              className="block text-sm font-medium text-gray-700"
            >
              Genre
            </label>
          </FloatLabel>
        );
      case 2:
        return (
          <div className="flex w-fit">
            <FloatLabel>
              <Calendar
                id="min"
                yearRange="1900:2024"
                value={years?.min}
                onChange={(e) => handleDateChange(e, "min")}
                view="year"
                minDate={new Date(1900, 0, 1)}
                maxDate={new Date(moment())}
                dateFormat="yy"
                className="w-fit px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <label
                htmlFor="min"
                className="block text-sm font-medium text-gray-700"
              >
                Min Year
              </label>
            </FloatLabel>
            <FloatLabel>
              <Calendar
                id="max"
                value={years?.max}
                onChange={(e) => handleDateChange(e, "max")}
                view="year"
                minDate={new Date(1900, 0, 1)}
                maxDate={new Date(moment())}
                dateFormat="yy"
                yearRange="1900:2024"
                className="w-fit px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <label
                htmlFor="max"
                className="block text-sm font-medium text-gray-700"
              >
                Max Year
              </label>
            </FloatLabel>
          </div>
        );

      case 3:
        return (
          <FloatLabel>
            <InputText
              id="title"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Search Text
            </label>
          </FloatLabel>
        );
      default:
        break;
    }
  }, [
    genre,
    genreLookup,
    handleDateChange,
    searchText,
    searchType,
    years?.max,
    years?.min,
  ]);

  let myAlbums = null,
    myCompanies = null,
    myArtists = null;
  if (albums) {
    const { albumsByGenre } = albums;
    myAlbums = albumsByGenre;
  }
  if (companies) {
    const { companyByFoundedYear } = companies;
    myCompanies = companyByFoundedYear;
  }
  if (artists) {
    const { searchArtistByArtistName } = artists;
    myArtists = searchArtistByArtistName;
  }

  return (
    <div className="p-4">
      <div className="rounded-lg overflow-hidden shadow-3 p-4 flex justify-around items-center gap-4 mb-4">
        <div className="w-fit flex flex-col justify-center gap-6">
          <div className="flex items-center">
            <RadioButton
              inputId="albumsByGenre"
              name="searchType"
              value={1}
              onChange={(e) => handleSearchType(e.value)}
              checked={searchType === 1}
              unstyled
            />
            <label htmlFor="albumsByGenre" className="ml-1">
              albumsByGenre
            </label>
          </div>
          <div className="flex items-center">
            <RadioButton
              inputId="companyByFoundedYear"
              name="searchType"
              value={2}
              onChange={(e) => handleSearchType(e.value)}
              checked={searchType === 2}
              unstyled
            />
            <label htmlFor="companyByFoundedYear" className="ml-1">
              companyByFoundedYear
            </label>
          </div>
          <div className="flex items-center">
            <RadioButton
              inputId="searchArtistByArtistName"
              name="searchType"
              value={3}
              onChange={(e) => handleSearchType(e.value)}
              checked={searchType === 3}
              unstyled
            />
            <label htmlFor="searchArtistByArtistName" className="ml-1">
              searchArtistByArtistName
            </label>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          {getInputHTML()}
          <button
            className="bg-green-900 font-medium w-fit text-white px-4 py-2 rounded-lg shadow-3 hover:bg-green-950"
            onClick={(e) => handleSearch(e)}
          >
            Search
          </button>
        </div>
      </div>
      <div>
        {searchType === 1 && myAlbums
          ? myAlbums.map((album) => (
              <div
                key={album.id}
                className="max-w-sm rounded-lg overflow-hidden flex flex-col h-full shadow-3 justify-between p-4"
              >
                <div className="p-4">
                  <Link to={`/albums/${album.id}`}>
                    <h2 className="text-2xl font-bold mb-2 text-center hover:text-action">
                      {album.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600">
                    Genre: {MusicGenre[album.genre]}
                  </p>
                  <p className="text-gray-600">
                    Release Date: {new Date(album.releaseDate).toDateString()}
                  </p>
                  <p className="text-gray-600">Artist: {album.artist.name}</p>
                  <p className="text-gray-600">
                    Company: {album.recordCompany.name}
                  </p>
                </div>
              </div>
            ))
          : searchType === 1 && (
              <div className="flex justify-center items-center p-6">
                No Albums Found
              </div>
            )}
      </div>
      <div>
        {searchType === 2 && myCompanies
          ? myCompanies.map((company) => (
              <div
                key={company.id}
                className="max-w-sm rounded-lg overflow-hidden flex flex-col h-full shadow-3 justify-between p-4"
              >
                <div className="p-4">
                  <Link
                    to={`/companies/${company.id}`}
                    className="hover:text-action"
                  >
                    <h2 className="text-2xl font-bold mb-2 text-center">
                      {company.name}
                    </h2>
                  </Link>
                  <p className="text-gray-600">
                    Number of Albums: {company.numOfAlbums}
                  </p>
                  <p className="text-gray-600">Country: {company.country}</p>
                  <p className="text-gray-600">
                    Founded Year: {company.foundedYear}
                  </p>
                </div>
              </div>
            ))
          : searchType === 2 && (
              <div className="flex justify-center items-center p-6">
                No Companies Found
              </div>
            )}
      </div>
      <div>
        {searchType === 3 && myArtists
          ? myArtists.map((artist) => (
              <div
                key={artist.id}
                className="max-w-sm rounded-lg overflow-hidden flex flex-col h-full shadow-3 justify-between p-4"
              >
                <div className="p-4">
                  <Link to={`/artists/${artist.id}`}>
                    <h2 className="text-2xl font-bold mb-2 text-center hover:text-action">
                      {artist.name}
                    </h2>
                  </Link>
                  <p className="text-gray-600">
                    Number of Albums: {artist.numOfAlbums}
                  </p>
                  <p className="text-gray-600">
                    Date Formed: {new Date(artist.dateFormed).toDateString()}
                  </p>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Members</h3>
                    <ul className="list-disc list-inside">
                      {artist.members.map((member, index) => (
                        <li key={index} className="text-gray-700">
                          {member}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          : searchType === 3 && (
              <div className="flex justify-center items-center p-6">
                No Artists Found
              </div>
            )}
      </div>
    </div>
  );
};

export default QuerySearch;
