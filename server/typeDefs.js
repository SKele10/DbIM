export const typeDefs = `#graphql
    type Query {
        artists: [Artist]
        albums: [Album]
        recordCompanies: [RecordCompany]
        getArtistById(_id: String!): Artist
        getAlbumById(_id: String!): Album
        getCompanyById(_id: String!): RecordCompany
        getSongsByArtistId(artistId: String!): [String]
        albumsByGenre (genre: MusicGenre!): [Album]
        companyByFoundedYear (min: Int!, max: Int!) : [RecordCompany]
        searchArtistByArtistName (searchTerm: String!): [Artist]
    }

    type Artist {
        id: String!
        name: String!
        dateFormed: Date!
        members: [String!]!
        albums: [Album!]!,
        numOfAlbums: Int
    }
  
    type Album {
        id: String!
        title: String!
        releaseDate: Date!
        genre: MusicGenre!
        artist: Artist!
        recordCompany: RecordCompany!
        songs: [String!]!
    }
    
    type RecordCompany {
        id: String!
        name: String!
        foundedYear: Int!
        country: String
        albums: [Album!]!,
        numOfAlbums: Int
    }

    type Mutation {
        addArtist(
            name: String!,
            date_formed: Date!,
            members: [String!]!
        ): Artist
        editArtist(
            _id: String!,
            name: String,
            date_formed: Date,
            members: [String!]
        ): Artist
        removeArtist(_id: String!): Artist
        addCompany(
            name: String!,
            founded_year: Int!,
            country: String!
        ): RecordCompany
        editCompany(
            _id: String!,
            name: String,
            founded_year: Int,
            country: String
        ): RecordCompany
        removeCompany(_id: String!): RecordCompany
        addAlbum(
            title: String!,
            releaseDate: Date!,
            genre: MusicGenre!,
            songs: [String!]!,
            artistId: String!,
            companyId: String!
        ): Album
        editAlbum(
            _id: String!,
            title: String,
            releaseDate: Date,
            genre: MusicGenre,
            songs: [String!],
            artistId: String,
            companyId: String
        ): Album
        removeAlbum(_id: String!): Album
    }

    enum MusicGenre {
    POP
    ROCK
    HIP_HOP
    COUNTRY
    JAZZ
    CLASSICAL
    ELECTRONIC
    R_AND_B
    INDIE
    ALTERNATIVE
    }

    scalar Date
`;
