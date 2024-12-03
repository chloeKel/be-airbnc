const { formatData, createRef, mapData } = require("../utils");
const index = require("../db/data/test/index");

describe("formatData", () => {
  beforeEach(() => {
    dataSample = [
      {
        property_type: "Apartment",
        description: "Description of Apartment.",
      },
      {
        property_type: "House",
        description: "Description of House.",
      },
    ];
  });

  test("should not mutate passed data", () => {
    formatData(dataSample); // testing invocation
    expect(dataSample).toEqual([
      {
        property_type: "Apartment",
        description: "Description of Apartment.",
      },
      {
        property_type: "House",
        description: "Description of House.",
      },
    ]);
    // testing return value
    const result = formatData(dataSample);
    expect(result).not.toEqual(dataSample);
  });

  test("return value should be of type array", () => {
    const result = formatData(dataSample);
    expect(Array.isArray(result)).toBe(true);
  });

  test("should reformat data into array of nested arrays for insertion into the database", () => {
    const result = formatData(dataSample);
    expect(result).toEqual([
      ["Apartment", "Description of Apartment."],
      ["House", "Description of House."],
    ]);
  });
});

describe("createRef", () => {
  beforeEach(() => {
    mockCB = jest.fn((user) => `${user.first_name} ${user.surname}`);
    dataSample = [
      {
        user_id: 5,
        first_name: "Isabella",
        surname: "Martinez",
        email: "isabella@example.com",
        phone_number: "+44 7000 555555",
        role: "host",
        avatar: "https://example.com/images/isabella.jpg",
        created_at: "2024-12-01T11:37:52.536Z",
      },
      {
        user_id: 6,
        first_name: "Rachel",
        surname: "Cummings",
        email: "rachel@example.com",
        phone_number: "+44 7000 666666",
        role: "guest",
        avatar: "https://example.com/images/rachel.jpg",
        created_at: "2024-12-01T11:37:52.536Z",
      },
    ];
  });

  test("should take a callback function as an arguement which defines the key", () => {
    createRef(dataSample, mockCB, "user_id");
    expect(mockCB).toHaveBeenCalled();
    expect(mockCB).toHaveBeenCalledTimes(2);
    dataSample.forEach((item) => {
      expect(mockCB).toHaveBeenCalledWith(item);
    });
  });

  test("should return an object", () => {
    const result = createRef(dataSample, mockCB, "user_id");
    expect(typeof result).toBe("object");
  });

  test("assigned two keys and maps the values of those keys to eachother as a key value pair", () => {
    const result = createRef(dataSample, mockCB, "user_id");
    expect(result).not.toHaveProperty("user_id");
    expect(result).not.toHaveProperty("full_name");
    expect(result).toHaveProperty("Isabella Martinez");
    expect(result["Isabella Martinez"]).toBe(5);
  });

  test("assigns multiple key value pairs", () => {
    const result = createRef(dataSample, mockCB, "user_id");
    expect(Object.keys(result).length).toBe(2);
  });
});

describe("mapData", () => {
  beforeEach(() => {
    refObj = {
      "Alice Johnson": 1,
      "Bob Smith": 2,
      "Emma Davis": 3,
      "Isabella Martinez": 4,
      "Rachel Cummings": 5,
    };
    dataSample = [
      {
        name: "Modern Apartment in City Center",
        property_type: "Apartment",
        location: "London, UK",
        price_per_night: 120.0,
        description: "Description of Modern Apartment in City Center.",
        host_name: "Alice Johnson",
      },
    ];
  });

  test("should not mutate passed data", () => {
    mapData(dataSample, refObj, "host_id", "host_name");
    expect(dataSample).toEqual([
      {
        name: "Modern Apartment in City Center",
        property_type: "Apartment",
        location: "London, UK",
        price_per_night: 120.0,
        description: "Description of Modern Apartment in City Center.",
        host_name: "Alice Johnson",
      },
    ]);
  });

  test("should map a new property to each object in the array, with the value obtained by referencing a property in a reference object", () => {
    const result = mapData(dataSample, refObj, "host_id", "host_name");
    result.forEach((item) => {
      expect(item).toHaveProperty("host_id");
      expect(typeof item.host_id).toBe("number");
    });
  });

  test("should remove key value pair that is no longer required", () => {
    const result = mapData(dataSample, refObj, "host_id", "host_name");
    result.forEach((item) => {
      expect(item).not.toHaveProperty("host_name");
    });
  });

  test("should include all other non-specified key value pairs", () => {
    const result = mapData(dataSample, refObj, "host_id", "host_name");
    result.forEach((item) => {
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("property_type");
      expect(item).toHaveProperty("location");
      expect(item).toHaveProperty("price_per_night");
      expect(item).toHaveProperty("description");
    });
  });

  test("should map correct value to new property for each object in the array", () => {
    const result = mapData(index.propertiesData, refObj, "host_id", "host_name");
    result.forEach((item) => {
      if (item.host_name === "Alice Johsnson") {
        expect(item.host_id).toBe(1);
      }
    });
  });

  test("should return an array of objects, lenght of the array should match length of original data", () => {
    const result = mapData(index.propertiesData, refObj, "host_id", "host_name");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(index.propertiesData.length);
    result.forEach((item) => {
      expect(typeof item).toBe("object");
    });
  });
});
