import { useCallback, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import queries from "../services/queries";
import { Link } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Chips } from "primereact/chips";
import { FloatLabel } from "primereact/floatlabel";
import moment from "moment";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { checkDate, checkString, checkName } from "../services/helpers";

const Artists = () => {
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: null,
    dateFormed: null,
    members: [],
  });
  const { loading, error, data, refetch } = useQuery(queries.GET_ARTISTS, {
    fetchPolicy: "cache-and-network",
  });
  const [addArtist] = useMutation(queries.ADD_ARTIST);
  const [editArtist] = useMutation(queries.EDIT_ARTIST);
  const [removeArtist] = useMutation(queries.REMOVE_ARTIST, {
    refetchQueries: [{ query: queries.GET_ARTISTS }],
  });

  const handleAdd = useCallback((e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsEdit(false);
    setFormData({
      name: null,
      dateFormed: null,
      members: [],
    });
    setVisible(true);
  }, []);

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
      });
    },
    [removeArtist]
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
          refetch();
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
      refetch,
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

  if (data) {
    const { artists } = data;
    return (
      <div className="text-primary font-montserrat p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Artists: {artists.length}</h1>
          <button
            className="bg-green-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-green-950"
            onClick={handleAdd}
          >
            Add Artist
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {artists.map((artist) => (
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
              <div className="flex justify-between">
                <button
                  className="bg-blue-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-blue-950"
                  onClick={(e) => handleEdit(e, artist)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-red-950"
                  onClick={(e) => handleRemove(e, artist)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
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

export default Artists;
