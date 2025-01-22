const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");

const app = express();
const port = 3001;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jwt = require("jsonwebtoken");
const moment = require("moment");

const User = require("./models/user");
const Todo = require("./models/todo");
const Habit = require("./models/habit");

mongoose
  .connect("mongodb+srv://aserdeyu:aserdeyu@cluster0.xuxhj.mongodb.net/")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connectin to mongoDb", error);
  });

app.listen(port, () => {
  console.log("Server is running on port 3001");
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    ///check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered");
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();

    res.status(202).json({ message: "User registered successfully" });
  } catch (error) {
    console.log("Error registering the user", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");

  return secretKey;
};

const secretKey = generateSecretKey();

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid Email" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(200).json({ token, userId: user._id }); // Include userId
  } catch (error) {
    console.log("Login failed", error);
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("name email"); 
    // .select(...) to limit fields if you like

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log("Error fetching user by ID:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/todos/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { title, category, dueDate } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: "Title and category are required" });
    }

    const formattedDueDate = dueDate ? moment(dueDate).toISOString() : null;

    const newTodo = new Todo({
      title,
      category,
      dueDate: formattedDueDate, // This will be null if no date is provided
      user: userId,
    });

    await newTodo.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.todos.push(newTodo._id);
    await user.save();

    res.status(200).json({ message: "Todo added successfully", todo: newTodo });
  } catch (error) {
    console.log("Error adding todo:", error);
    res.status(500).json({ message: "Todo not added" });
  }
});

app.delete("/todos/:todoId", async (req, res) => {
  try {
    const { todoId } = req.params;

    // Validate todoId format
    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      return res.status(400).json({ error: "Invalid todoId format." });
    }

    // Attempt to delete the todo
    const deletedTodo = await Todo.findByIdAndDelete(todoId);

    // Check if todo was found and deleted
    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo not found." });
    }

    res.status(200).json({ message: "Todo deleted successfully." });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Unable to delete the Todo" });
  }
});

app.get("/users/:userId/todos", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate("todos");
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    res.status(200).json({ todos: user.todos });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.patch("/todos/:todoId/complete", async (req, res) => {
  try {
    const todoId = req.params.todoId;

    const updatedTodo = await Todo.findByIdAndUpdate(
      todoId,
      {
        status: "completed",
      },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res
      .status(200)
      .json({ message: "Todo marked as complete", todo: updatedTodo });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Example user-specific endpoint (calendar)
app.get("/users/:userId/todos/completed/:date", async (req, res) => {
  try {
    const { userId, date } = req.params;

    // If your Todo schema references the user, e.g.:
    // todoSchema = new mongoose.Schema({
    //   ...
    //   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    // })
    // Then you can filter by user:
    const completedTodos = await Todo.find({
      user: userId, // Only fetch this user's todos
      status: "completed",
      createdAt: {
        $gte: new Date(`${date}T00:00:00.000Z`),
        $lt: new Date(`${date}T23:59:59.999Z`),
      },
    }).exec();

    res.status(200).json({ completedTodos });
  } catch (error) {
    console.log("Error fetching user's completed todos:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.get("/todos/completed/:date", async (req, res) => {
  try {
    const date = req.params.date;

    const completedTodos = await Todo.find({
      status: "completed",
      createdAt: {
        $gte: new Date(`${date}T00:00:00.000Z`), // Start of the selected date
        $lt: new Date(`${date}T23:59:59.999Z`), // End of the selected date
      },
    }).exec();

    res.status(200).json({ completedTodos });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/users/:userId/todos/count", async (req, res) => {
  try {
    const { userId } = req.params;

    // Only count tasks belonging to this user
    const totalCompletedTodos = await Todo.countDocuments({
      user: userId,
      status: "completed",
    });
    const totalPendingTodos = await Todo.countDocuments({
      user: userId,
      status: "pending",
    });

    res.status(200).json({ totalCompletedTodos, totalPendingTodos });
  } catch (error) {
    console.log("Error in /users/:userId/todos/count:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/habits", async (req, res) => {
  try {
      const { title, color, repeatMode, days, reminder, userId } = req.body;

      // Validate required fields
      if (!title || !color || !userId) {
          return res.status(400).json({ error: "Title, color, and userId are required." });
      }

      // Validate repeatMode
      if (!["daily", "weekly"].includes(repeatMode)) {
          return res.status(400).json({ error: "Invalid repeat mode." });
      }

      // If repeatMode is weekly, ensure days are provided
      if (repeatMode === "weekly" && (!days || days.length === 0)) {
          return res.status(400).json({ error: "Please select at least one day for weekly habits." });
      }

      // If reminder is enabled, ensure time is provided
      if (reminder && reminder.enabled && !reminder.time) {
          return res.status(400).json({ error: "Please provide a reminder time." });
      }

      const newHabit = new Habit({
          title,
          color,
          repeatMode,
          days: repeatMode === "weekly" ? days : [],
          reminder: reminder && reminder.enabled
              ? {
                    enabled: true,
                    time: reminder.time,
                }
              : {
                    enabled: false,
                    time: null,
                },
          user: userId, // Associate habit with userId
      });

      const savedHabit = await newHabit.save();
      res.status(201).json(savedHabit);
  } catch (error) {
      console.error("Error creating habit:", error);
      res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/habitslist", async (req, res) => {
  try {
    const userId = req.query.userId; // Retrieve userId from query parameters

    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }

    // Validate userId format (optional but recommended)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format." });
    }

    // Fetch habits specific to the user
    const userHabits = await Habit.find({ user: userId });

    res.status(200).json(userHabits);
  } catch (error) {
    console.error("Error fetching habits:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.delete("/habits/:habitId", async (req, res) => {
  try {
    const { habitId } = req.params;

    // Validate habitId format
    if (!mongoose.Types.ObjectId.isValid(habitId)) {
      return res.status(400).json({ error: "Invalid habitId format." });
    }

    // Attempt to delete the habit
    const deletedHabit = await Habit.findByIdAndDelete(habitId);

    // Check if habit was found and deleted
    if (!deletedHabit) {
      return res.status(404).json({ error: "Habit not found." });
    }

    res.status(200).json({ message: "Habit deleted successfully." });
  } catch (error) {
    console.error("Error deleting habit:", error);
    res.status(500).json({ error: "Unable to delete the habit." });
  }
});

app.put("/habits/:habitId/completed", async (req, res) => {
  const habitId = req.params.habitId;
  const updatedCompletion = req.body.completed; // The updated completion object

  try {
    const updatedHabit = await Habit.findByIdAndUpdate(
      habitId,
      { completed: updatedCompletion },
      { new: true }
    );

    if (!updatedHabit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    return res.status(200).json(updatedHabit);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET single habit
app.get("/habits/:habitId", async (req, res) => {
  try {
    const { habitId } = req.params;
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({ error: "Habit not found." });
    }
    res.status(200).json(habit);
  } catch (error) {
    console.error("Error fetching single habit:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// PUT update habit
app.put("/habits/:habitId", async (req, res) => {
  try {
    const { habitId } = req.params;
    const updateData = req.body;

    // Optional: Validate user ownership
    const { userId } = updateData;
    if (userId) {
      const habit = await Habit.findOne({ _id: habitId, user: userId });
      if (!habit) {
        return res.status(404).json({ error: "Habit not found or not yours." });
      }
    }

    // Handle repeatMode and days
    if (updateData.repeatMode === "weekly" && !updateData.days) {
      updateData.days = []; // or handle accordingly
    }

    // Use $set to update only the provided fields
    const updatedHabit = await Habit.findByIdAndUpdate(
      habitId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedHabit) {
      return res.status(404).json({ error: "Habit not found." });
    }

    res.status(200).json(updatedHabit);
  } catch (error) {
    console.error("Error updating habit:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Helper function
async function getDailyStatsForPastWeek(userId) {
  const dailyStats = [];

  // Loop from 6 days ago up to today (0)
  for (let i = 6; i >= 0; i--) {
    // Build a date for that day
    const date = moment().subtract(i, "days").startOf("day");
    const dayName = date.format("ddd"); // e.g. 'Mon', 'Tue'

    // Start + end of the day
    const startOfDay = date.toDate();
    const endOfDay = moment(date).endOf("day").toDate();

    // Count how many todos were "completed" that day
    const completedCount = await Todo.countDocuments({
      user: userId,
      status: "completed",
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Count how many todos were "pending" that day
    const pendingCount = await Todo.countDocuments({
      user: userId,
      status: "pending",
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    dailyStats.push({
      day: dayName,
      completed: completedCount,
      pending: pendingCount,
    });
  }

  return dailyStats; // e.g. [ {day:'Wed', completed:2, pending:4}, {...}, ... ]
}

// Your route that calls the helper:
app.get("/users/:userId/todos/weekly-stats", async (req, res) => {
  try {
    const { userId } = req.params;

    // Call the helper to build "dailyStats" for the last 7 days
    const dailyStats = await getDailyStatsForPastWeek(userId);

    return res.status(200).json({ dailyStats });
  } catch (error) {
    console.error("Error in /users/:userId/todos/weekly-stats:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});







