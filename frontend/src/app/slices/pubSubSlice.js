import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { pubSubStatsAPI, pubSubTestAPI } from "../actions/pubSubActions";

export const getPubSubStats = createAsyncThunk(
  "pubsub/getPubSubStats",
  async (settings, thunkAPI) => {
    const response = await pubSubStatsAPI(settings);
    const jsonResponse = await response.json();
    return jsonResponse;
  }
);

export const sendPubSubTest = createAsyncThunk(
  "pubsub/sendPubSubTest",
  async (publish, thunkAPI) => {
    const response = await pubSubTestAPI(publish);
    const jsonResponse = await response.json();
    return jsonResponse;
  }
)
export const pubSubSlice = createSlice({
  name: "pubsub",
  initialState: {
    settings: {},
    connection: {
      status: 'false',
      message: '',
      color: ''
    },
    pub: {},
    sub: {},
    test: {}
  },
  reducers: {
    setSettings(state, action) {
      const settings = action.payload;
      for (const property in settings) {
        state.settings[property] = Number(settings[property]);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPubSubStats.pending, (state) => {
        state.connection.message = "Testing started...";
        state.connection.color = "orange";
        console.log("/pubsub API request pending");
      })
      .addCase(getPubSubStats.fulfilled, (state, action) => {
        const { publishInformation, subscriptionInformation, connected } = action.payload;
        state.pub = publishInformation;
        state.sub = subscriptionInformation;

        if (connected) {
          state.connection.status = connected;
          state.connection.message = "Testing completed";
          state.connection.color = "green";
        } else {
          state.connection.message = "Testing failed";
          state.connection.color = "red";
        }
      })
      .addCase(getPubSubStats.rejected, (state) => {
        state.connection.message = "Network Error";
        state.connection.color = "red";
        console.log("/pubsub API request rejected");
      });
    builder
      .addCase(sendPubSubTest.pending, () => {
        console.log("/test/subpub request pending");
      })
      .addCase(sendPubSubTest.fulfilled, (state, action) => {
        const { topic, message, connected } = action.payload;
        if (connected) {
          state.test = { topic, message, connected };
        }
      })
      .addCase(sendPubSubTest.rejected, () => {
        console.log("/test/subpub request rejected");
      });
  }
});

export const { setSettings } = pubSubSlice.actions;
export default pubSubSlice.reducer;
