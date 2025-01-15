import { useCallback, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import queries from "../services/queries";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { FloatLabel } from "primereact/floatlabel";
import { checkDate, checkString, checkName } from "../services/helpers";

const CompanyDetails = () => {
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: null,
    foundedYear: null,
    country: null,
  });
  let { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(queries.GET_COMPANY_BY_ID, {
    variables: { id: id },
  });
  const [editCompany] = useMutation(queries.EDIT_COMPANY, {
    refetchQueries: [{ query: queries.GET_COMPANIES }],
  });
  const [removeCompany] = useMutation(queries.REMOVE_COMPANY, {
    refetchQueries: [{ query: queries.GET_COMPANIES }],
  });
  const handleEdit = useCallback((e, data) => {
    e.preventDefault();
    setErrorMessage("");
    setIsEdit(true);
    setFormData({
      id: data.id,
      name: data.name,
      foundedYear: new Date(data.foundedYear, 0, 1),
      country: data.country,
    });
    setVisible(true);
  }, []);

  const handleRemove = useCallback(
    (e, data) => {
      e.preventDefault();
      removeCompany({
        variables: {
          id: data.id,
        },
      }).then(() => navigate("/companies"));
    },
    [navigate, removeCompany]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (isEdit) {
        try {
          checkString(formData.id, "id");
          checkName(formData.name, "name");
          checkName(formData.country, "country");
          if (
            !(formData.foundedYear instanceof Date) ||
            isNaN(formData.foundedYear)
          ) {
            throw new Error(`Invalid founded year`);
          }
          if (
            formData.foundedYear.getFullYear() < 1900 ||
            formData.foundedYear.getFullYear() > 2024
          )
            throw new Error(`Invalid founded year`, {
              extensions: { code: "BAD_USER_INPUT" },
            });
        } catch (error) {
          return setErrorMessage(error);
        }

        editCompany({
          variables: {
            id: formData.id,
            name: formData.name,
            foundedYear: formData.foundedYear.getFullYear(),
            country: formData.country,
          },
        }).then(() => {
          setVisible(false);
        });
      }
    },
    [
      editCompany,
      formData.country,
      formData.foundedYear,
      formData.id,
      formData.name,
      isEdit,
    ]
  );

  const handleInputChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, foundedYear: e.value });
  };

  if (data) {
    const { getCompanyById } = data;
    return (
      <div className="font-montserrat p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-4 text-primary">
            {getCompanyById.name}
          </h1>
          <div className="flex gap-2">
            <button
              className="bg-blue-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-blue-950"
              onClick={(e) => handleEdit(e, getCompanyById)}
            >
              Edit
            </button>
            <button
              className="bg-red-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-red-950"
              onClick={(e) => handleRemove(e, getCompanyById)}
            >
              Remove
            </button>
          </div>
        </div>
        <div className="p-8 font-montserrat">
          <p className="text-lg text-gray-600 mb-2">
            Founded Year: {getCompanyById.foundedYear}
          </p>
          <p className="text-lg text-gray-600 mb-2">
            Country: {getCompanyById.country}
          </p>
          <p className="text-lg text-gray-600 mb-2">
            Number of Albums: {getCompanyById.numOfAlbums}
          </p>

          <div className="flex justify-between gap-8">
            <div className="max-w-sm rounded-lg overflow-hidden flex flex-col w-full h-full shadow-3 justify-between p-4">
              <h2 className="text-xl font-semibold mb-2">Albums:</h2>
              {getCompanyById.numOfAlbums === 0 ? (
                <p>No albums available.</p>
              ) : (
                <ul className="list-disc list-inside">
                  {getCompanyById.albums.map((album, index) => (
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
          </div>
        </div>
        <Dialog
          header={isEdit ? "Edit Company" : "Add Company"}
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
                <InputText
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange(e, "country")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country
                </label>
              </FloatLabel>
            </div>
            <div className="mb-6">
              <FloatLabel>
                <Calendar
                  id="foundedYear"
                  value={formData.foundedYear}
                  onChange={handleDateChange}
                  view="year"
                  dateFormat="yy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <label
                  htmlFor="foundedYear"
                  className="block text-sm font-medium text-gray-700"
                >
                  Founded Year
                </label>
              </FloatLabel>
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

export default CompanyDetails;
