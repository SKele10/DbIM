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

const ArtistDetails = () => {
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: null,
    dateFormed: null,
    members: [],
  });
  const navigate = useNavigate();
  const [addArtist] = useMutation(queries.ADD_ARTIST, {
    refetchQueries: [{ query: queries.GET_ARTISTS }],
  });
  const [editArtist] = useMutation(queries.EDIT_ARTIST, {
    refetchQueries: [{ query: queries.GET_ARTISTS }],
  });
  const [removeArtist] = useMutation(queries.REMOVE_ARTIST, {
    refetchQueries: [{ query: queries.GET_ARTISTS }],
  });
  let { id } = useParams();
  const { loading, error, data } = useQuery(queries.GET_ARTIST_BY_ID, {
    variables: { id: id },
  });
  const {
    loading: songLoading,
    error: songError,
    data: songs,
  } = useQuery(queries.GET_SONGS_BY_ARTIST_ID, {
    variables: { artistId: id },
  });

  const handleEdit = useCallback((e, data) => {
    e.preventDefault();
    setErrorMessage("");
    setIsEdit(true);
    setFormData({
      id: data.id,
      name: data.name,
      dateFormed: new Date(data.dateFormed),
      members: data.members,
    });
    setVisible(true);
  }, []);

  const handleRemove = useCallback(
    (e, data) => {
      e.preventDefault();
      removeArtist({
        variables: {
          id: data.id,
        },
      }).then(() => {
        navigate("/artists");
      });
    },
    [navigate, removeArtist]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (isEdit) {
        try {
          checkString(formData.name, "Artist Name");
          checkDate(
            moment(formData.dateFormed).format("MM/DD/YYYY"),
            "Date Formed"
          );
          if (formData.members && formData.members.length < 1)
            throw new Error(`Atleast one member is required`);
          formData.members.map((member) => {
            checkName(member, "Member Name");
          });

          if (
            moment(formData.dateFormed).year() < 1900 ||
            moment(formData.dateFormed) > moment()
          ) {
            throw new Error(`Date is invalid`, {
              extensions: { code: "BAD_USER_INPUT" },
            });
          }
        } catch (error) {
          return setErrorMessage(error);
        }

        editArtist({
          variables: {
            id: formData.id,
            name: formData.name,
            dateFormed: moment(formData.dateFormed).format("MM/DD/YYYY"),
            members: formData.members,
          },
        }).then(() => {
          setVisible(false);
        });
      } else {
        try {
          checkString(formData.name, "Artist Name");
          checkDate(
            moment(formData.dateFormed).format("MM/DD/YYYY"),
            "Date Formed"
          );
          if (formData.members && formData.members.length < 1)
            throw new Error(`Atleast one member is required`);
          formData.members.map((member) => {
            checkName(member, "Member Name");
          });
        } catch (error) {
          return setErrorMessage(error);
        }

        addArtist({
          variables: {
            name: formData.name,
            dateFormed: moment(formData.dateFormed).format("MM/DD/YYYY"),
            members: formData.members,
          },
        }).then(() => {
          setVisible(false);
        });
      }
    },
    [
      addArtist,
      editArtist,
      formData.dateFormed,
      formData.id,
      formData.members,
      formData.name,
      isEdit,
    ]
  );

  const handleInputChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, dateFormed: e.value });
  };

  const handleChipsChange = (members) => {
    setFormData({ ...formData, members });
  };
  let mySongs = null;
  if (songs) {
    const { getSongsByArtistId } = songs;
    mySongs = getSongsByArtistId;
  }
  if (data) {
    const { getArtistById } = data;
    return (
      <div className="font-montserrat p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-4 text-primary">
            {getArtistById.name}
          </h1>
          <div className="flex gap-2">
            <button
              className="bg-blue-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-blue-950"
              onClick={(e) => handleEdit(e, getArtistById)}
            >
              Edit
            </button>
            <button
              className="bg-red-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-red-950"
              onClick={(e) => handleRemove(e, getArtistById)}
            >
              Remove
            </button>
          </div>
        </div>
        <div className="p-8 font-montserrat">
          <p className="text-lg text-gray-600 mb-2">
            Formed on {new Date(getArtistById.dateFormed).toLocaleDateString()}
          </p>
          <p className="text-lg text-gray-600 mb-2">
            Number of Albums: {getArtistById.numOfAlbums}
          </p>
          <div className="flex justify-between gap-8">
            <div className="mb-4 max-w-sm rounded-lg overflow-hidden flex flex-col w-full h-full shadow-3 justify-between p-4">
              <h2 className="text-xl font-semibold mb-2">Members:</h2>
              <ul className="list-disc list-inside">
                {getArtistById.members.map((member, index) => (
                  <li key={index}>{member}</li>
                ))}
              </ul>
            </div>
            <div className="max-w-sm rounded-lg overflow-hidden flex flex-col w-full h-full shadow-3 justify-between p-4">
              <h2 className="text-xl font-semibold mb-2">Albums:</h2>
              {getArtistById.numOfAlbums === 0 ? (
                <p>No albums available.</p>
              ) : (
                <ul className="list-disc list-inside">
                  {getArtistById.albums.map((album, index) => (
                    <li key={index}>
                      <Link
                        to={`/albums/${album.id}`}
                        className="hover:text-action"
                      >
                        {album.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="max-w-sm rounded-lg overflow-hidden flex flex-col w-full h-full shadow-3 justify-between p-4">
              <h2 className="text-xl font-semibold mb-2">Songs:</h2>
              {songError || (mySongs && mySongs.length < 0) ? (
                <p>No songs available.</p>
              ) : (
                <ul className="list-disc list-inside">
                  {mySongs &&
                    mySongs.length > 0 &&
                    mySongs?.map((song, index) => <li key={index}>{song}</li>)}
                </ul>
              )}
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
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange(e, "name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
              </FloatLabel>
            </div>
            <div className="mb-6">
              <FloatLabel>
                <Calendar
                  id="dateFormed"
                  value={formData.dateFormed}
                  onChange={handleDateChange}
                  dateFormat="mm/dd/yy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <label
                  htmlFor="dateFormed"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date Formed
                </label>
              </FloatLabel>
            </div>
            <div className="mb-6">
              <FloatLabel>
                <Chips
                  id="members"
                  value={formData.members}
                  onChange={(e) => handleChipsChange(e.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <label
                  htmlFor="members"
                  className="block text-sm font-medium text-gray-700"
                >
                  Members
                </label>
              </FloatLabel>
              <small>Press Enter to add member input</small>
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

export default ArtistDetails;
