import { useCallback, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import queries from "../services/queries";
import { Link } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Chips } from "primereact/chips";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import moment from "moment";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { checkDate, checkString, checkName } from "../services/helpers";
import MusicGenre from "../services/enums";

const Albums = () => {
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    title: null,
    releaseDate: null,
    genre: null,
    songs: [],
    artistId: null,
    companyId: null,
  });
  const genreLookup = [];
  Object.keys(MusicGenre).map((genre) =>
    genreLookup.push({
      id: genre,
      title: MusicGenre[genre],
    })
  );
  const { loading, error, data } = useQuery(queries.GET_ALBUMS, {
    fetchPolicy: "cache-and-network",
  });
  const artistQuery = useQuery(queries.GET_ARTISTS_LOOKUP, {
    fetchPolicy: "cache-and-network",
  });
  const companyQuery = useQuery(queries.GET_COMPANIES_LOOKUP, {
    fetchPolicy: "cache-and-network",
  });
  const [addAlbum, { error: addError }] = useMutation(queries.ADD_ALBUM, {
    refetchQueries: [{ query: queries.GET_ALBUMS }],
  });
  const [editAlbum, { error: editError }] = useMutation(queries.EDIT_ALBUM, {
    refetchQueries: [{ query: queries.GET_ALBUMS }],
  });
  const [removeAlbum] = useMutation(queries.REMOVE_ALBUM, {
    refetchQueries: [{ query: queries.GET_ALBUMS }],
  });

  const handleAdd = useCallback((e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsEdit(false);
    setFormData({
      title: null,
      releaseDate: null,
      genre: null,
      songs: [],
      artistId: null,
      companyId: null,
    });
    setVisible(true);
  }, []);

  const handleEdit = useCallback((e, data) => {
    e.preventDefault();
    setErrorMessage("");
    setIsEdit(true);
    setFormData({
      id: data.id,
      title: data.title,
      releaseDate: new Date(data.releaseDate),
      genre: genreLookup.find((item) => item.id === data.genre),
      songs: data.songs,
      artistId: artistQuery.data.artists.find(
        (artist) => artist.id === data.artist.id
      ),
      companyId: companyQuery.data.recordCompanies.find(
        (company) => company.id === data.recordCompany.id
      ),
    });
    setVisible(true);
  }, []);

  const handleRemove = useCallback(
    (e, data) => {
      e.preventDefault();
      removeAlbum({
        variables: {
          id: data.id,
        },
      });
    },
    [removeAlbum]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (isEdit) {
        try {
          checkString(formData.id, "id");
          checkString(formData.artistId?.id, "artist");
          checkString(formData.companyId?.id, "company");
          checkString(formData.title, "Title");
          checkString(formData.genre?.id, "Genre");
          checkDate(
            moment(formData.releaseDate).format("MM/DD/YYYY"),
            "Release Date"
          );
          if (formData.songs && formData.songs.length < 1)
            throw new Error(`Atleast one song is required`);
          formData.songs.map((song) => {
            checkName(song, "Song Name");
          });
        } catch (error) {
          return setErrorMessage(error);
        }

        editAlbum({
          variables: {
            id: formData.id,
            title: formData.title,
            releaseDate: moment(formData.releaseDate).format("MM/DD/YYYY"),
            genre: formData.genre.id,
            songs: formData.songs,
            artistId: formData.artistId.id,
            companyId: formData.companyId.id,
          },
        }).then(() => {
          setVisible(false);
        });
      } else {
        try {
          checkString(formData.artistId?.id, "artist");
          checkString(formData.companyId?.id, "company");
          checkString(formData.title, "Title");
          checkString(formData.genre?.id, "Genre");
          checkDate(
            moment(formData.releaseDate).format("MM/DD/YYYY"),
            "Release Date"
          );
          if (formData.songs && formData.songs.length < 1)
            throw new Error(`Atleast one song is required`);
          formData.songs.map((song) => {
            checkName(song, "Song Name");
          });
        } catch (error) {
          return setErrorMessage(error);
        }

        addAlbum({
          variables: {
            title: formData.title,
            releaseDate: moment(formData.releaseDate).format("MM/DD/YYYY"),
            genre: formData.genre.id,
            songs: formData.songs,
            artistId: formData.artistId.id,
            companyId: formData.companyId.id,
          },
        }).then(() => {
          setVisible(false);
        });
      }
    },
    [addAlbum, editAlbum, formData, isEdit]
  );

  const handleInputChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };
  const handleGenreChange = (e) => {
    setFormData({ ...formData, genre: e.target.value });
  };
  const handleDateChange = (e) => {
    setFormData({ ...formData, releaseDate: e.value });
  };
  const handleDropdownChange = (e, field) => {
    setFormData({ ...formData, [field]: e.value });
  };

  const handleChipsChange = (songs) => {
    setFormData({ ...formData, songs });
  };
  if (data) {
    const { albums } = data;
    return (
      <div className="text-primary font-montserrat p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Albums: {albums.length}</h1>
          <button
            className="bg-green-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-green-950"
            onClick={handleAdd}
          >
            Add Album
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {albums.map((album) => (
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
              <div className="flex justify-between">
                <button
                  className="bg-blue-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-blue-950"
                  onClick={(e) => handleEdit(e, album)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-red-950"
                  onClick={(e) => handleRemove(e, album)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <Dialog
          header={isEdit ? "Edit Album" : "Add Album"}
          visible={visible}
          style={{ width: "30vw" }}
          onHide={() => setVisible(false)}
        >
          <form className="max-w-md mx-auto p-8">
            <div className="mb-6">
              <FloatLabel>
                <InputText
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange(e, "title")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
              </FloatLabel>
            </div>
            <div className="mb-6">
              <FloatLabel>
                <Dropdown
                  id="genre"
                  value={formData.genre}
                  options={genreLookup}
                  onChange={(e) => handleGenreChange(e)}
                  optionLabel="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <label
                  htmlFor="genre"
                  className="block text-sm font-medium text-gray-700"
                >
                  Genre
                </label>
              </FloatLabel>
            </div>
            <div className="mb-6">
              <FloatLabel>
                <Calendar
                  id="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleDateChange}
                  dateFormat="mm/dd/yy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <label
                  htmlFor="releaseDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Release Date
                </label>
              </FloatLabel>
            </div>

            {artistQuery?.data?.artists && (
              <div className="mb-6">
                <FloatLabel>
                  <Dropdown
                    id="artistId"
                    value={formData.artistId}
                    options={artistQuery.data.artists}
                    onChange={(e) => handleDropdownChange(e, "artistId")}
                    optionLabel="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <label
                    htmlFor="artistId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Artist
                  </label>
                </FloatLabel>
              </div>
            )}
            {companyQuery?.data?.recordCompanies && (
              <div className="mb-6">
                <FloatLabel>
                  <Dropdown
                    id="companyId"
                    value={formData.companyId}
                    options={companyQuery.data.recordCompanies}
                    onChange={(e) => handleDropdownChange(e, "companyId")}
                    optionLabel="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <label
                    htmlFor="companyId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company
                  </label>
                </FloatLabel>
              </div>
            )}
            <div className="mb-6">
              <FloatLabel>
                <Chips
                  id="songs"
                  value={formData.songs}
                  onChange={(e) => handleChipsChange(e.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <label
                  htmlFor="songs"
                  className="block text-sm font-medium text-gray-700"
                >
                  Songs
                </label>
              </FloatLabel>
              <small>Press Enter to add song input</small>
            </div>
            <button
              className="bg-green-900 hover:bg-green-950 text-white font-bold py-2 px-4 rounded"
              onClick={handleSubmit}
            >
              {isEdit ? "Edit" : "Add"}
            </button>
            {errorMessage && (
              <div className="text-red-400">{errorMessage.message}</div>
            )}
            {editError && (
              <div className="text-red-400">{editError.message}</div>
            )}
            {addError && <div className="text-red-400">{addError.message}</div>}
          </form>
        </Dialog>
      </div>
    );
  } else if (loading) {
    return <div>Loading</div>;
  } else if (error) {
    return <div className="p-6 text-red-400">{error.message}</div>;
  }
};

export default Albums;
