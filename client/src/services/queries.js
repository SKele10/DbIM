import { gql } from "@apollo/client";

const GET_ARTISTS = gql`
  query {
    artists {
      name
      numOfAlbums
      members
      id
      dateFormed
    }
  }
`;
const GET_ARTIST_BY_ID = gql`
  query getArtistById($id: String!) {
    getArtistById(_id: $id) {
      albums {
        id
        title
      }
      dateFormed
      id
      members
      name
      numOfAlbums
    }
  }
`;
const GET_ARTISTS_LOOKUP = gql`
  query {
    artists {
      id
      name
    }
  }
`;

const GET_ALBUMS = gql`
  query {
    albums {
      songs
      title
      releaseDate
      recordCompany {
        id
        name
      }
      artist {
        id
        name
      }
      genre
      id
    }
  }
`;
const GET_ALBUM_BY_ID = gql`
  query getAlbumById($id: String!) {
    getAlbumById(_id: $id) {
      artist {
        id
        name
      }
      genre
      id
      recordCompany {
        id
        name
      }
      releaseDate
      songs
      title
    }
  }
`;
const GET_ALBUMS_LOOKUP = gql`
  query {
    albums {
      id
      title
    }
  }
`;

const GET_COMPANIES = gql`
  query {
    recordCompanies {
      name
      country
      numOfAlbums
      foundedYear
      id
    }
  }
`;
const GET_COMPANY_BY_ID = gql`
  query getCompanyById($id: String!) {
    getCompanyById(_id: $id) {
      albums {
        id
        title
      }
      country
      foundedYear
      id
      name
      numOfAlbums
    }
  }
`;
const GET_COMPANIES_LOOKUP = gql`
  query {
    recordCompanies {
      id
      name
    }
  }
`;

const GET_SONGS_BY_ARTIST_ID = gql`
  query getSongsByArtistId($artistId: String!) {
    getSongsByArtistId(artistId: $artistId)
  }
`;

const ADD_ARTIST = gql`
  mutation addArtist($name: String!, $dateFormed: Date!, $members: [String!]!) {
    addArtist(name: $name, date_formed: $dateFormed, members: $members) {
      name
      numOfAlbums
      members
      id
      dateFormed
    }
  }
`;

const EDIT_ARTIST = gql`
  mutation editArtist(
    $id: String!
    $name: String
    $dateFormed: Date
    $members: [String!]
  ) {
    editArtist(
      _id: $id
      name: $name
      date_formed: $dateFormed
      members: $members
    ) {
      dateFormed
      id
      members
      name
      numOfAlbums
    }
  }
`;
const REMOVE_ARTIST = gql`
  mutation removeArtist($id: String!) {
    removeArtist(_id: $id) {
      dateFormed
      id
      members
      name
      numOfAlbums
    }
  }
`;

const ADD_ALBUM = gql`
  mutation addAlbum(
    $title: String!
    $releaseDate: Date!
    $genre: MusicGenre!
    $songs: [String!]!
    $artistId: String!
    $companyId: String!
  ) {
    addAlbum(
      title: $title
      releaseDate: $releaseDate
      genre: $genre
      songs: $songs
      artistId: $artistId
      companyId: $companyId
    ) {
      id
      genre
      recordCompany {
        id
        name
      }
      artist {
        id
        name
      }
      releaseDate
      songs
      title
    }
  }
`;

const EDIT_ALBUM = gql`
  mutation editAlbum(
    $id: String!
    $title: String
    $releaseDate: Date
    $genre: MusicGenre
    $songs: [String!]
    $artistId: String
    $companyId: String
  ) {
    editAlbum(
      _id: $id
      title: $title
      releaseDate: $releaseDate
      genre: $genre
      songs: $songs
      artistId: $artistId
      companyId: $companyId
    ) {
      id
      releaseDate
      songs
      title
      genre
      artist {
        id
        name
      }
      recordCompany {
        id
        name
      }
    }
  }
`;
const REMOVE_ALBUM = gql`
  mutation removeAlbum($id: String!) {
    removeAlbum(_id: $id) {
      artist {
        id
        name
      }
      genre
      id
      recordCompany {
        id
        name
      }
      releaseDate
      songs
      title
    }
  }
`;

const ADD_COMPANY = gql`
  mutation addCompany($name: String!, $foundedYear: Int!, $country: String!) {
    addCompany(name: $name, founded_year: $foundedYear, country: $country) {
      albums {
        id
        title
      }
      country
      foundedYear
      id
      name
      numOfAlbums
    }
  }
`;

const EDIT_COMPANY = gql`
  mutation editCompany(
    $id: String!
    $name: String
    $foundedYear: Int
    $country: String
  ) {
    editCompany(
      _id: $id
      name: $name
      founded_year: $foundedYear
      country: $country
    ) {
      albums {
        id
        title
      }
      country
      foundedYear
      id
      name
      numOfAlbums
    }
  }
`;
const REMOVE_COMPANY = gql`
  mutation removeCompany($id: String!) {
    removeCompany(_id: $id) {
      albums {
        id
        title
      }
      country
      foundedYear
      id
      name
      numOfAlbums
    }
  }
`;
const SEARCH_ARTIST_BY_NAME = gql`
  query searchArtistByArtistName($searchTerm: String!) {
    searchArtistByArtistName(searchTerm: $searchTerm) {
      albums {
        id
        title
      }
      dateFormed
      id
      members
      name
      numOfAlbums
    }
  }
`;

const ALBUMS_BY_GENRE = gql`
  query albumsByGenre($genre: MusicGenre!) {
    albumsByGenre(genre: $genre) {
      artist {
        id
        name
      }
      genre
      id
      recordCompany {
        id
        name
      }
      releaseDate
      songs
      title
    }
  }
`;

const COMPANY_BY_FOUNDED_YEAR = gql`
  query companyByFoundedYear($min: Int!, $max: Int!) {
    companyByFoundedYear(min: $min, max: $max) {
      albums {
        id
        title
      }
      country
      foundedYear
      id
      name
      numOfAlbums
    }
  }
`;

let exported = {
  GET_ARTISTS,
  GET_ARTIST_BY_ID,
  GET_ARTISTS_LOOKUP,
  GET_ALBUMS,
  GET_ALBUM_BY_ID,
  GET_ALBUMS_LOOKUP,
  GET_COMPANIES,
  GET_COMPANY_BY_ID,
  GET_COMPANIES_LOOKUP,
  ADD_ARTIST,
  EDIT_ARTIST,
  REMOVE_ARTIST,
  ADD_ALBUM,
  EDIT_ALBUM,
  REMOVE_ALBUM,
  ADD_COMPANY,
  EDIT_COMPANY,
  REMOVE_COMPANY,
  GET_SONGS_BY_ARTIST_ID,
  SEARCH_ARTIST_BY_NAME,
  ALBUMS_BY_GENRE,
  COMPANY_BY_FOUNDED_YEAR,
};

export default exported;
