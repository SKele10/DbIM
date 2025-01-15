import { GraphQLError } from "graphql";
import { ObjectId } from "mongodb";
import {
  albums as albumCollection,
  artists as artistCollection,
  recordcompanies as recordcompanyCollection,
} from "./config/mongoCollections.js";
import helper from "./helper.js";

import { createClient } from "redis";
import moment from "moment";

const client = createClient();
client.connect().then(() => {});

export const resolvers = {
  Query: {
    getArtistById: async (_, args) => {
      let exist = await client.exists(`artist:${args._id}`);
      if (exist) {
        let existingDetails = await client.json.get(`artist:${args._id}`);
        return existingDetails;
      }

      const artists = await artistCollection();
      const artist = await artists.findOne({
        _id: ObjectId.createFromHexString(args._id),
      });
      if (!artist) {
        throw new GraphQLError("Artist Not Found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      artist.id = artist._id.toString();
      delete artist._id;
      await client.json.set(`artist:${args._id}`, "$", artist);
      return artist;
    },
    getAlbumById: async (_, args) => {
      let exist = await client.exists(`album:${args._id}`);
      if (exist) {
        let existingDetails = await client.json.get(`album:${args._id}`);
        return existingDetails;
      }

      const albums = await albumCollection();
      const album = await albums.findOne({
        _id: ObjectId.createFromHexString(args._id),
      });
      if (!album) {
        throw new GraphQLError("Album Not Found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      album.id = album._id.toString();
      delete album._id;
      await client.json.set(`album:${args._id}`, "$", album);
      return album;
    },
    getCompanyById: async (_, args) => {
      let exist = await client.exists(`recordCompany:${args._id}`);
      if (exist) {
        let existingDetails = await client.json.get(
          `recordCompany:${args._id}`
        );
        return existingDetails;
      }

      const recordCompanies = await recordcompanyCollection();
      const recordCompany = await recordCompanies.findOne({
        _id: ObjectId.createFromHexString(args._id),
      });
      if (!recordCompany) {
        throw new GraphQLError("RecordCompany Not Found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      recordCompany.id = recordCompany._id.toString();
      delete recordCompany._id;
      await client.json.set(`recordCompany:${args._id}`, "$", recordCompany);
      return recordCompany;
    },
    artists: async () => {
      let exist = await client.exists("artists");
      if (exist) {
        let existingList = await client.json.get("artists");
        return existingList;
      }
      const artists = await artistCollection();
      const allArtists = await artists.find({}).toArray();
      if (!allArtists) {
        throw new GraphQLError(`Internal Server Error`, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
      allArtists.map((artist) => {
        artist.id = artist._id.toString();
        delete artist._id;
        return artist;
      });
      await client.json.set("artists", "$", allArtists);
      await client.expire("artists", 3600);
      return allArtists;
    },
    albums: async () => {
      let exist = await client.exists("albums");
      if (exist) {
        let existingList = await client.json.get("albums");
        return existingList;
      }
      const albums = await albumCollection();
      const allAlbums = await albums.find({}).toArray();
      if (!allAlbums) {
        throw new GraphQLError(`Internal Server Error`, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
      allAlbums.map((album) => {
        album.id = album._id.toString();
        delete album._id;
        return album;
      });

      await client.json.set("albums", "$", allAlbums);
      await client.expire("albums", 3600);
      return allAlbums;
    },
    recordCompanies: async () => {
      let exist = await client.exists("recordCompanies");
      if (exist) {
        let existingList = await client.json.get("recordCompanies");
        return existingList;
      }
      const recordCompanies = await recordcompanyCollection();
      const allRecordCompanies = await recordCompanies.find({}).toArray();
      if (!allRecordCompanies) {
        throw new GraphQLError(`Internal Server Error`, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
      allRecordCompanies.map((recordCompany) => {
        recordCompany.id = recordCompany._id.toString();
        delete recordCompany._id;
        return recordCompany;
      });

      await client.json.set("recordCompanies", "$", allRecordCompanies);
      await client.expire("recordCompanies", 3600);
      return allRecordCompanies;
    },
    getSongsByArtistId: async (_, args) => {
      let exist = await client.exists(`songs:${args.artistId}`);
      if (exist) {
        let existingList = await client.lRange(`songs:${args.artistId}`, 0, -1);
        existingList = existingList.map((item) => JSON.parse(item));
        return existingList;
      }
      const albums = await albumCollection();
      const allAlbums = await albums
        .find({
          artistId: ObjectId.createFromHexString(args.artistId),
        })
        .toArray();
      if (allAlbums.length < 1) {
        throw new GraphQLError("Artist Not Found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      const songs = [];
      allAlbums.map((album) => {
        if (album.songs) {
          album.songs.forEach((song) => {
            songs.push(song);
          });
        }
      });
      songs.forEach(async (song) => {
        await client.lPush(`songs:${args.artistId}`, JSON.stringify(song));
      });
      await client.expire(`songs:${args.artistId}`, 3600);
      return songs;
    },
    albumsByGenre: async (_, args) => {
      let exist = await client.exists(args.genre);
      if (exist) {
        let existingList = await client.lRange(args.genre, 0, -1);
        existingList = existingList.map((item) => JSON.parse(item));
        return existingList;
      }
      const albums = await albumCollection();
      const allAlbums = await albums
        .find({
          genre: args.genre.toUpperCase(),
        })
        .toArray();
      if (allAlbums.length < 1) {
        throw new GraphQLError("No Albums with given genre", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      for (let album of allAlbums) {
        album.id = album._id.toString();
        delete album._id;
        await client.lPush(args.genre, JSON.stringify(album));
      }

      await client.expire(args.genre, 3600);
      return allAlbums;
    },
    companyByFoundedYear: async (_, args) => {
      if (args.min < 1900 || args.max > 2024 || args.min > args.max)
        throw new GraphQLError("Invalid Date Range", {
          extensions: { code: "NOT_FOUND" },
        });

      let exist = await client.exists(`${args.min}:${args.max}`);
      if (exist) {
        let existingList = await client.lRange(
          `${args.min}:${args.max}`,
          0,
          -1
        );
        existingList = existingList.map((item) => JSON.parse(item));
        return existingList;
      }
      const recordcompanies = await recordcompanyCollection();
      const allRecordCompanies = await recordcompanies
        .find({
          foundedYear: { $gte: args.min, $lte: args.max },
        })
        .toArray();
      if (allRecordCompanies.length < 1) {
        throw new GraphQLError("No Record Company Found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      for (let company of allRecordCompanies) {
        company.id = company._id.toString();
        delete company._id;
        await client.lPush(`${args.min}:${args.max}`, JSON.stringify(company));
      }

      await client.expire(`${args.min}:${args.max}`, 3600);

      return allRecordCompanies;
    },
    searchArtistByArtistName: async (_, args) => {
      args.searchTerm = args.searchTerm.trim();
      if (!args.searchTerm)
        throw new GraphQLError("Invalid search", {
          extensions: { code: "NOT_FOUND" },
        });

      let exist = await client.exists(args.searchTerm.toLowerCase());
      if (exist) {
        let existingList = await client.lRange(
          args.searchTerm.toLowerCase(),
          0,
          -1
        );
        existingList = existingList.map((item) => JSON.parse(item));
        return existingList;
      }
      const artists = await artistCollection();
      const allArtist = await artists
        .find({
          name: {
            $regex: args.searchTerm,
            $options: "i",
          },
        })
        .toArray();
      if (allArtist.length < 1) {
        throw new GraphQLError("No Artist Found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      for (let artist of allArtist) {
        artist.id = artist._id.toString();
        delete artist._id;
        await client.lPush(
          args.searchTerm.toLowerCase(),
          JSON.stringify(artist)
        );
      }

      await client.expire(args.searchTerm.toLowerCase(), 3600);
      return allArtist;
    },
  },
  Artist: {
    albums: async (parentValue) => {
      if (typeof parentValue.id == "string")
        parentValue.id = ObjectId.createFromHexString(parentValue.id);
      const albums = await albumCollection();
      const albumList = await albums
        .find({ artistId: parentValue.id })
        .toArray();
      albumList.map((album) => {
        album.id = album._id.toString();
        delete album._id;
        return album;
      });
      return albumList;
    },
    numOfAlbums: async (parentValue) => {
      if (typeof parentValue.id == "string")
        parentValue.id = ObjectId.createFromHexString(parentValue.id);
      const albums = await albumCollection();
      const albumCount = await albums.count({
        artistId: parentValue.id,
      });
      return albumCount;
    },
  },
  Album: {
    artist: async (parentValue) => {
      if (typeof parentValue.artistId == "string")
        parentValue.artistId = ObjectId.createFromHexString(
          parentValue.artistId
        );
      const artists = await artistCollection();
      const artist = await artists.findOne({
        _id: parentValue.artistId,
      });
      artist.id = artist._id.toString();
      delete artist._id;
      return artist;
    },
    recordCompany: async (parentValue) => {
      if (typeof parentValue.recordCompanyId == "string")
        parentValue.recordCompanyId = ObjectId.createFromHexString(
          parentValue.recordCompanyId
        );
      const recordCompanies = await recordcompanyCollection();
      const recordCompany = await recordCompanies.findOne({
        _id: parentValue.recordCompanyId,
      });
      recordCompany.id = recordCompany._id.toString();
      delete recordCompany._id;
      return recordCompany;
    },
  },
  RecordCompany: {
    albums: async (parentValue) => {
      if (typeof parentValue.id == "string")
        parentValue.id = ObjectId.createFromHexString(parentValue.id);
      const albums = await albumCollection();
      const albumList = await albums
        .find({ recordCompanyId: parentValue.id })
        .toArray();
      albumList.map((album) => {
        album.id = album._id.toString();
        delete album._id;
        return album;
      });
      return albumList;
    },
    numOfAlbums: async (parentValue) => {
      if (typeof parentValue.id == "string")
        parentValue.id = ObjectId.createFromHexString(parentValue.id);
      const albums = await albumCollection();
      const albumCount = await albums.count({
        recordCompanyId: parentValue.id,
      });
      return albumCount;
    },
  },
  Mutation: {
    addArtist: async (_, args) => {
      args.name = helper.checkString(args.name, "Artist Name");
      args.members.map((member) => {
        member = helper.checkName(member, "Member Name");
        return member;
      });
      args.date_formed = helper.checkDate(args.date_formed, "Date Formed");
      if (
        moment(args.date_formed).year() < 1900 ||
        moment(args.date_formed) > moment()
      ) {
        throw new GraphQLError(`Date is invalid`, {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      const newArtist = {
        name: args.name,
        dateFormed: args.date_formed,
        members: args.members,
        albums: [],
      };

      const artists = await artistCollection();
      let insertedArtist = await artists.insertOne(newArtist);
      if (!insertedArtist.acknowledged || !insertedArtist.insertedId) {
        throw new GraphQLError(`Could not Add Artist`, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
      newArtist.id = insertedArtist.insertedId.toString();

      await client.json.set(`artist:${newArtist.id}`, "$", newArtist);
      await client.json.del("artists");

      return newArtist;
    },
    editArtist: async (_, args) => {
      args._id = helper.checkObjectId(args._id);
      const artists = await artistCollection();
      let updatedArtist = await artists.findOne({
        _id: ObjectId.createFromHexString(args._id),
      });
      if (updatedArtist) {
        if (args.name) {
          args.name = helper.checkString(args.name, "Artist Name");
          updatedArtist.name = args.name;
        }
        if (args.date_formed) {
          args.date_formed = helper.checkDate(args.date_formed, "Date Formed");
          updatedArtist.dateFormed = args.date_formed;
        }
        if (args.members) {
          args.members.map((member) => {
            member = helper.checkName(member, "Member Name");
            return member;
          });
          updatedArtist.members = args.members;
        }
        await artists.updateOne(
          { _id: ObjectId.createFromHexString(args._id) },
          { $set: updatedArtist }
        );
        updatedArtist.id = updatedArtist._id.toString();
        delete updatedArtist._id;
      } else {
        throw new GraphQLError(
          `Could not update artist with _id of ${args._id}`,
          {
            extensions: { code: "NOT_FOUND" },
          }
        );
      }
      await client.json.set(`artist:${updatedArtist.id}`, "$", updatedArtist);
      await client.json.del("artists");
      return updatedArtist;
    },
    removeArtist: async (_, args) => {
      if (!ObjectId.isValid(args._id))
        throw new GraphQLError(`Invalid ObjectId`, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      const artists = await artistCollection();
      const deletedArtist = await artists.findOneAndDelete({
        _id: ObjectId.createFromHexString(args._id),
      });

      if (!deletedArtist) {
        throw new GraphQLError(
          `Could not delete artist with _id of ${args._id}`,
          {
            extensions: { code: "NOT_FOUND" },
          }
        );
      }
      const albums = await albumCollection();
      const recordCompanies = await recordcompanyCollection();
      const allAlbums = await albums
        .find({
          artistId: deletedArtist._id,
        })
        .toArray();
      allAlbums.forEach(async (album) => {
        await client.json.del(`album:${album._id.toString()}`);
        await recordCompanies.updateMany(
          { albums: album._id },
          { $pull: { albums: album._id } }
        );
      });
      await albums.deleteMany({
        artistId: deletedArtist._id,
      });
      deletedArtist.id = deletedArtist._id.toString();
      delete deletedArtist._id;
      await client.json.del(`artist:${args._id}`);
      await client.json.del("artists");
      return deletedArtist;
    },
    addCompany: async (_, args) => {
      args.name = helper.checkName(args.name, "Company Name");
      args.country = helper.checkString(args.country, "Country");
      if (args.founded_year < 1900 || args.founded_year > 2024)
        throw new GraphQLError(`Invalid founded year`, {
          extensions: { code: "BAD_USER_INPUT" },
        });
      const newCompany = {
        name: args.name,
        foundedYear: args.founded_year,
        country: args.country,
      };

      const recordCompanies = await recordcompanyCollection();
      let insertedRecordCompany = await recordCompanies.insertOne(newCompany);
      if (
        !insertedRecordCompany.acknowledged ||
        !insertedRecordCompany.insertedId
      ) {
        throw new GraphQLError(`Could not Add Record Company`, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
      newCompany.id = insertedRecordCompany.insertedId.toString();
      await client.json.set(`recordCompany:${newCompany.id}`, "$", newCompany);
      await client.json.del("recordCompanies");
      return newCompany;
    },
    editCompany: async (_, args) => {
      args._id = helper.checkObjectId(args._id);
      const recordcompanies = await recordcompanyCollection();
      let updatedRecordCompany = await recordcompanies.findOne({
        _id: ObjectId.createFromHexString(args._id),
      });
      if (updatedRecordCompany) {
        if (args.name) {
          args.name = helper.checkName(args.name, "Company Name");
          updatedRecordCompany.name = args.name;
        }
        if (args.founded_year) {
          if (args.founded_year < 1900 || args.founded_year > 2024)
            throw new GraphQLError(`Invalid founded year`, {
              extensions: { code: "INTERNAL_SERVER_ERROR" },
            });
          updatedRecordCompany.foundedYear = args.founded_year;
        }
        if (args.country) {
          args.country = helper.checkString(args.country, "Country");
          updatedRecordCompany.country = args.country;
        }
        await recordcompanies.updateOne(
          { _id: ObjectId.createFromHexString(args._id) },
          { $set: updatedRecordCompany }
        );
        updatedRecordCompany.id = updatedRecordCompany._id.toString();
        delete updatedRecordCompany._id;
      } else {
        throw new GraphQLError(
          `Could not update record company with _id of ${args._id}`,
          {
            extensions: { code: "NOT_FOUND" },
          }
        );
      }
      await client.json.set(
        `recordCompany:${updatedRecordCompany.id}`,
        "$",
        updatedRecordCompany
      );
      await client.json.del("recordCompanies");
      return updatedRecordCompany;
    },
    removeCompany: async (_, args) => {
      if (!ObjectId.isValid(args._id))
        throw new GraphQLError(`Invalid ObjectId`, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      const recordcompanies = await recordcompanyCollection();
      const deletedRecordCompany = await recordcompanies.findOneAndDelete({
        _id: ObjectId.createFromHexString(args._id),
      });

      if (!deletedRecordCompany) {
        throw new GraphQLError(
          `Could not delete record company with _id of ${args._id}`,
          {
            extensions: { code: "NOT_FOUND" },
          }
        );
      }
      const albums = await albumCollection();
      const artists = await artistCollection();
      const allAlbums = await albums
        .find({
          recordCompanyId: deletedRecordCompany._id,
        })
        .toArray();
      allAlbums.forEach(async (album) => {
        await client.json.del(`album:${album._id.toString()}`);
        await artists.updateMany(
          { albums: album._id },
          { $pull: { albums: album._id } }
        );
      });
      await albums.deleteMany({
        recordCompanyId: deletedRecordCompany._id,
      });

      await client.flushAll();
      deletedRecordCompany.id = deletedRecordCompany._id.toString();
      delete deletedRecordCompany._id;
      return deletedRecordCompany;
    },
    addAlbum: async (_, args) => {
      args.title = helper.checkString(args.title, "Title");
      args.genre = helper.checkString(args.genre, "Genre");
      args.releaseDate = helper.checkDate(args.releaseDate, "Release Date");
      args.songs.map((song) => {
        song = helper.checkString(song, "Song Name");
        return song;
      });

      args.artistId = helper.checkObjectId(args.artistId);
      args.companyId = helper.checkObjectId(args.companyId);

      const artists = await artistCollection();
      const artist = await artists.findOne({
        _id: ObjectId.createFromHexString(args.artistId),
      });
      if (!artist)
        throw new GraphQLError(`Could not find Artist`, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });

      if (moment(artist.dateFormed) > moment(args.releaseDate))
        throw new GraphQLError(
          `Release Date is before the date formed of artist`,
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );

      const recordCompanies = await recordcompanyCollection();
      const recordCompany = await recordCompanies.findOne({
        _id: ObjectId.createFromHexString(args.companyId),
      });
      if (!recordCompany)
        throw new GraphQLError(`Could not find Record Company`, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });

      const newAlbum = {
        title: args.title,
        releaseDate: args.releaseDate,
        genre: args.genre,
        artistId: ObjectId.createFromHexString(args.artistId),
        recordCompanyId: ObjectId.createFromHexString(args.companyId),
        songs: args.songs,
      };
      const albums = await albumCollection();
      let insertedAlbum = await albums.insertOne(newAlbum);
      if (!insertedAlbum.acknowledged || !insertedAlbum.insertedId) {
        throw new GraphQLError(`Could not Add Album`, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }

      await recordCompanies.updateOne(
        { _id: recordCompany._id },
        { $push: { albums: insertedAlbum.insertedId } }
      );
      await artists.updateOne(
        { _id: artist._id },
        { $push: { albums: insertedAlbum.insertedId } }
      );
      newAlbum.id = insertedAlbum.insertedId.toString();

      await client.json.set(`album:${newAlbum.id}`, "$", newAlbum);
      await client.json.del("albums");

      return newAlbum;
    },
    editAlbum: async (_, args) => {
      args._id = helper.checkObjectId(args._id);
      const albums = await albumCollection();
      let updatedAlbum = await albums.findOne({
        _id: ObjectId.createFromHexString(args._id),
      });
      if (updatedAlbum) {
        if (args.title) {
          args.title = helper.checkString(args.title, "Title");
          updatedAlbum.title = args.title;
        }
        if (args.genre) {
          args.genre = helper.checkString(args.genre, "Genre");
          updatedAlbum.genre = args.genre;
        }
        if (args.releaseDate) {
          args.releaseDate = helper.checkDate(args.releaseDate, "Release Date");
          updatedAlbum.releaseDate = args.releaseDate;
        }
        if (args.songs) {
          args.songs.map((song) => {
            song = helper.checkName(song, "Song Name");
            return song;
          });
          updatedAlbum.songs = args.songs;
        }
        if (args.artistId) {
          args.artistId = helper.checkObjectId(args.artistId);
          const artists = await artistCollection();
          const artist = await artists.findOne({
            _id: ObjectId.createFromHexString(args.artistId),
          });
          if (!artist)
            throw new GraphQLError(`Could not find Artist`, {
              extensions: { code: "INTERNAL_SERVER_ERROR" },
            });
          updatedAlbum.artistId = ObjectId.createFromHexString(args.artistId);
        }
        if (args.companyId) {
          args.companyId = helper.checkObjectId(args.companyId);
          const recordCompanies = await recordcompanyCollection();
          const recordCompany = await recordCompanies.findOne({
            _id: ObjectId.createFromHexString(args.companyId),
          });
          if (!recordCompany)
            throw new GraphQLError(`Could not find Record Company`, {
              extensions: { code: "INTERNAL_SERVER_ERROR" },
            });
          updatedAlbum.recordCompanyId = ObjectId.createFromHexString(
            args.companyId
          );
        }
        await albums.updateOne(
          { _id: ObjectId.createFromHexString(args._id) },
          { $set: updatedAlbum }
        );
        updatedAlbum.id = updatedAlbum._id.toString();
        delete updatedAlbum._id;
      } else {
        throw new GraphQLError(
          `Could not update artist with _id of ${args._id}`,
          {
            extensions: { code: "NOT_FOUND" },
          }
        );
      }
      await client.json.set(`album:${updatedAlbum.id}`, "$", updatedAlbum);
      await client.json.del("albums");
      return updatedAlbum;
    },
    removeAlbum: async (_, args) => {
      if (!ObjectId.isValid(args._id))
        throw new GraphQLError(`Invalid ObjectId`, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      const albums = await albumCollection();
      const deletedAlbum = await albums.findOneAndDelete({
        _id: ObjectId.createFromHexString(args._id),
      });

      if (!deletedAlbum) {
        throw new GraphQLError(
          `Could not delete artist with _id of ${args._id}`,
          {
            extensions: { code: "NOT_FOUND" },
          }
        );
      }
      const artists = await artistCollection();
      await artists.updateMany(
        { albums: deletedAlbum._id },
        { $pull: { albums: deletedAlbum._id } }
      );
      const recordcompanies = await recordcompanyCollection();
      await recordcompanies.updateMany(
        { albums: deletedAlbum._id },
        { $pull: { albums: deletedAlbum._id } }
      );
      deletedAlbum.id = deletedAlbum._id.toString();
      delete deletedAlbum._id;
      await client.json.del(`album:${args._id}`);
      await client.json.del("albums");
      return deletedAlbum;
    },
  },
};
