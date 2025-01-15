import { useCallback, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import queries from "../services/queries";
import { Link } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { FloatLabel } from "primereact/floatlabel";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { checkDate, checkString, checkName } from "../services/helpers";

const Companies = () => {
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: null,
    foundedYear: null,
    country: null,
  });

  const { loading, error, data } = useQuery(queries.GET_COMPANIES, {
    fetchPolicy: "cache-and-network",
  });
  const [addCompany] = useMutation(queries.ADD_COMPANY, {
    refetchQueries: [{ query: queries.GET_COMPANIES }],
  });
  const [editCompany] = useMutation(queries.EDIT_COMPANY, {
    refetchQueries: [{ query: queries.GET_COMPANIES }],
  });
  const [removeCompany] = useMutation(queries.REMOVE_COMPANY, {
    refetchQueries: [{ query: queries.GET_COMPANIES }],
  });

  const handleAdd = useCallback((e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsEdit(false);
    setFormData({
      name: null,
      foundedYear: null,
      country: null,
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
      });
    },
    [removeCompany]
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
      } else {
        try {
          checkName(formData?.name, "name");
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

        addCompany({
          variables: {
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
      addCompany,
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
    const { recordCompanies } = data;
    return (
      <div className="text-primary font-montserrat p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Companies: {recordCompanies.length}
          </h1>
          <button
            className="bg-green-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-green-950"
            onClick={handleAdd}
          >
            Add Company
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {recordCompanies.map((company) => (
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
              <div className="flex justify-between">
                <button
                  className="bg-blue-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-blue-950"
                  onClick={(e) => handleEdit(e, company)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-900 font-medium text-white px-4 py-2 rounded-lg shadow-3 hover:bg-red-950"
                  onClick={(e) => handleRemove(e, company)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
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

export default Companies;
