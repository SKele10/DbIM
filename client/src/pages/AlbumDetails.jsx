import React, { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Chips } from "primereact/chips";
import { FloatLabel } from "primereact/floatlabel";
import queries from "../services/queries";
import moment from "moment";
import { checkDate, checkString, checkName } from "../services/helpers";
import { Dropdown } from "primereact/dropdown";
import MusicGenre from "../services/enums";

const AlbumDetails = () => {
  let { id } = useParams();
  const { loading, error, data } = useQuery(queries.GET_ALBUM_BY_ID, {
    variables: { id: id },
  });
  const artistQuery = useQuery(queries.GET_ARTISTS_LOOKUP, {
    fetchPolicy: "cache-and-network",
  });
  const companyQuery = useQuery(queries.GET_COMPANIES_LOOKUP, {
    fetchPolicy: "cache-and-network",
  });
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
  const navigate = useNavigate();
  const genreLookup = [];
  Object.keys(MusicGenre).map((genre) =>
    genreLookup.push({
      id: genre,
      title: MusicGenre[genre],
    })
  );
  const [editAlbum, { error: editError }] = useMutation(queries.EDIT_ALBUM, {
    refetchQueries: [{ query: queries.GET_ALBUMS }],
  });
  const [removeAlbum] = useMutation(queries.REMOVE_ALBUM, {
    refetchQueries: [{ query: queries.GET_ALBUMS }],
  });
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
      }).then(() => {
        navigate("/albums");
      });
    },
    [navigate, removeAlbum]
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
      }
    },
    [editAlbum, formData, isEdit]
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
    const { getAlbumById } = data;
    return (
      <div className="font-montserrat p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-4 text-primary">
            {getAlbumById.title}
          </h1>
          <div className="flex gap-2">
            <button
              className="bg-blue-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-blue-950"
              onClick={(e) => handleEdit(e, getAlbumById)}
            >
              Edit
            </button>
            <button
              className="bg-red-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-red-950"
              onClick={(e) => handleRemove(e, getAlbumById)}
            >
              Remove
            </button>
          </div>
        </div>
        <div className="p-8 font-montserrat">
          <p className="text-lg text-gray-600 mb-2">
            Artist:{" "}
            <Link
              to={`/artists/${getAlbumById.artist.id}`}
              className="hover:text-action"
            >
              {getAlbumById.artist.name}
            </Link>
          </p>
          <p className="text-lg text-gray-600 mb-2">
            Release Date:{" "}
            {new Date(getAlbumById.releaseDate).toLocaleDateString()}
          </p>
          <p className="text-lg text-gray-600 mb-2">
            Record Company:{" "}
            <Link
              to={`/companies/${getAlbumById.recordCompany.id}`}
              className="hover:text-action"
            >
              {getAlbumById.recordCompany.name}
            </Link>
          </p>
          <div className="flex justify-between gap-8">
            <div className="mb-4 max-w-sm rounded-lg overflow-hidden flex flex-col w-full h-full shadow-3 justify-between p-4">
              <h2 className="text-xl font-semibold mb-2">Songs:</h2>
              <ul className="list-disc list-inside">
                {getAlbumById.songs.map((song, index) => (
                  <li key={index}>{song}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <Dialog
          header={isEdit ? "Edit Artist" : "Add Artist"}
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

export default AlbumDetails;
