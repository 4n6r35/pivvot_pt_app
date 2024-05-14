import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Modal, StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, useColorScheme, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NewTask, Task, TaskDetail, UpdateTask } from './core/entites';
import * as UseCases from './core/usecases/index';
import { TaskAdapterFetcher } from './config';

export interface ThemeColors {
  backgroundColor: string,
  text: string,
}

export const lightColors: ThemeColors = {
  backgroundColor: '#f3f2f7',
  text: 'black'
}

export const darkColors: ThemeColors = {
  backgroundColor: '#090909',
  text: 'white'
}

type ThemeColor = 'light' | 'dark';

interface ThemeContextProps {
  currentTheme: ThemeColor,
  colors: ThemeColors,
  setTheme: (theme: ThemeColor) => void
}

export const ThemeContext = createContext({} as ThemeContextProps);

export const ThemeProvider = ({ children }: PropsWithChildren<{}>) => {
  const colorScheme = useColorScheme();
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(colorScheme === 'dark' ? 'dark' : 'light');

  const setTheme = (theme: ThemeColor) => {
    setCurrentTheme(theme);
  }

  const themeColors = currentTheme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        colors: themeColors,
        setTheme
      }}>
      {children}
    </ThemeContext.Provider>
  )
}

const AppState = ({ children }: PropsWithChildren<{}>) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}

const TasksListScreen = ({ onCreateTaskPress }: { onCreateTaskPress: () => void }) => {
  const { currentTheme, colors, setTheme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[] | undefined>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deletedMessage, setDeletedMessage] = useState<string>('');
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState<string>('');
  const [updatedDescription, setUpdatedDescription] = useState<string>('');
  const [updatedDate, setUpdatedDate] = useState<string>('');
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateUpdated, setDateUpdated] = useState<boolean>(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [taskDetails, setTaskDetails] = useState<TaskDetail | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const tasks = await UseCases.ListTaskUseCase(TaskAdapterFetcher);
    setTasks(tasks);
    setLoading(false);
  };

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  const openModal = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setModalVisible(false);
  };

  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  const hideDatePickerHandler = () => {
    setShowDatePicker(false);
  };

  const openUpdateModal = (task: Task | null) => {
    if (task) {
      setUpdatedTitle(task.title || '');
      setUpdatedDescription(task.description || '');
      setUpdatedDate(task.date || '');
      setUpdateModalVisible(true);
    } else {
      console.error('No se puede abrir el modal de actualización: la tarea seleccionada es nula.');
    }

  };

  const closeUpdateModal = () => {
    setUpdateModalVisible(false);
  };

  const openDetailsModal = async (task: Task) => {
    setSelectedTask(task);
    await getTaskDetails();
    setDetailsModalVisible(true);
  };

  // Función para cerrar el modal de detalles de tarea
  const closeDetailsModal = () => {
    setSelectedTask(null);
    setDetailsModalVisible(false);
  };



  const deleteTask = async () => {
    try {
      if (!selectedTask) return;

      const response = await UseCases.DeleteTaskUseCase(TaskAdapterFetcher, selectedTask.id);

      if (response.ok === true) {
        await loadTasks();
        closeModal();
        setDeletedMessage('Tarea eliminada');
      }
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
    }
  };

  useEffect(() => {
    if (deletedMessage !== '') {
      setTimeout(() => {
        setDeletedMessage('');
      }, 3000);
    }
  }, [deletedMessage]);


  const updateTask = async (taskToUpdate: Task) => {

    if (!selectedTask) return;

    if (!dateUpdated) {
      setUpdateSuccessMessage('Por favor, definir nuevamente el fecha de realizacion.');
      return;
    }
    try {
      const updatedTaskData: UpdateTask = {
        id_task: selectedTask.id,
        title: updatedTitle,
        description: updatedDescription,
        date: updatedDate
      };

      console.log(updatedTaskData)
      const updatingTask = await UseCases.UpdateTaskUseCase(TaskAdapterFetcher, updatedTaskData);

      if (updatingTask.ok === true) {
        await loadTasks();
        closeUpdateModal();
        setUpdateSuccessMessage('Tarea actuallizada exitosamente');
        closeModal();
      }
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
    }
  };

  useEffect(() => {
    if (updateSuccessMessage !== '') {
      setTimeout(() => {
        setUpdateSuccessMessage('');
      }, 3000);
    }
  }, [updateSuccessMessage]);


  const getTaskDetails = async () => {
    try {
      if (!selectedTask) return;

      const response = await UseCases.GetByIdTaskUseCase(TaskAdapterFetcher, selectedTask.id);

      setTaskDetails(response.task as any)
      setLoading(false)
    } catch (error) {
      console.error('Error al obtener el detalle:', error);
      setLoading(false)
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.text} style={styles.loadingIndicator} />
      ) : (
        <>
          <Text style={[styles.header, { color: colors.text }]}>Tasks List</Text>
          {deletedMessage !== '' && <Text style={[styles.message_del, { color: 'green' }]}>{deletedMessage}</Text>}
          <View style={styles.buttonContainer}>
            <Button onPress={toggleTheme} title="Cambiar tema" />
            <Button onPress={onCreateTaskPress} title="Crear tarea" />
          </View>
          <FlatList
            style={styles.taskContainer}
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableHighlight
                onPress={() => openModal(item)}
                underlayColor={colors.backgroundColor}
              >
                <View style={styles.taskItemContainer}>
                  <View style={[styles.taskItem, { borderColor: colors.text }]}>
                    <Text style={[styles.taskText, { color: colors.text }]}>Title: {item.title}</Text>
                    <Text style={[styles.taskText, { color: colors.text }]}>Description: {item.description}</Text>
                    <Text style={[styles.taskText, { color: colors.text }]}>Creado: {item?.date}</Text>
                    <Text style={[styles.taskText, { color: colors.text }]}>Fecha de realización: {item.date_to_finish}</Text>
                    {updateSuccessMessage && selectedTask?.id === item.id && (
                      <Text style={[styles.message, { color: 'green' }]}>{updateSuccessMessage}</Text>
                    )}
                  </View>
                </View>
              </TouchableHighlight>
            )}
          />
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
          >
            <View style={styles.centeredView}>
              <View style={[styles.modalView, styles.updateModalView, currentTheme === 'dark' ? styles.darkModalView : styles.lightModalView]}>
                <Text style={[styles.modalText, { color: colors.text }]}>Escoge una opción</Text>
                <View style={styles.buttonContainer}>
                  <TouchableHighlight
                    style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                    onPress={deleteTask}
                  >
                    <Text style={styles.textStyle}>Eliminar</Text>
                  </TouchableHighlight>
                  <TouchableHighlight
                    style={{ ...styles.openButton, backgroundColor: "gray" }}
                    onPress={openUpdateModal as any}
                  >
                    <Text style={styles.textStyle}>Actualizar</Text>
                  </TouchableHighlight>
                  <TouchableHighlight
                    style={{ ...styles.openButton, backgroundColor: "orange" }}
                    onPress={openDetailsModal as any}
                  >
                    <Text style={styles.textStyle}>Detalles</Text>
                  </TouchableHighlight>
                  <TouchableHighlight
                    style={{ ...styles.openButton, backgroundColor: "#FFC0CB" }}
                    onPress={closeModal}
                  >
                    <Text style={styles.textStyle}>Cancelar</Text>
                  </TouchableHighlight>
                </View>
              </View>
            </View>
          </Modal>
          {/* Modal para actualizar la tarea */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={updateModalVisible}
            onRequestClose={closeUpdateModal}
          >
            <View style={styles.centeredView}>
              <View style={[styles.modalView, styles.updateModalView, currentTheme === 'dark' ? styles.darkModalView : styles.lightModalView]}>
                <Text style={[styles.modalText, { fontWeight: 'bold', color: colors.text }]}>Actualizar tarea</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  placeholderTextColor={colors.text}
                  value={updatedTitle}
                  onChangeText={setUpdatedTitle}
                />
                <TextInput
                  style={[styles.input, { height: 150 }]}
                  placeholder="Description"
                  placeholderTextColor={colors.text}
                  value={updatedDescription}
                  onChangeText={setUpdatedDescription}
                  numberOfLines={4}
                />
                <Text style={[{ fontSize: 15, fontWeight: 'bold' }, { color: colors.text }]}>Por favor, definir nuevamente el fecha de realizacion.</Text>

                <TouchableOpacity
                  onPress={showDatePickerHandler}
                  style={[styles.datePicker, { borderColor: colors.text, borderWidth: 1, borderRadius: 5, margin: 5 }]}
                >
                  <Text style={{ color: colors.text, margin: 5 }}>{updatedDate ? updatedDate : 'Fecha de realización'}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={updatedDate ? new Date(updatedDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setUpdatedDate(selectedDate.toISOString().split('T')[0]);
                        setDateUpdated(true);
                      }
                      hideDatePickerHandler();
                    }}
                  />
                )}
                <View style={styles.buttonContainer}>
                  <TouchableHighlight
                    style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                    onPress={updateTask as any}
                  >
                    <Text style={styles.textStyle}>Actualizar</Text>
                  </TouchableHighlight>
                  <TouchableHighlight
                    style={{ ...styles.openButton, backgroundColor: "#FFC0CB" }}
                    onPress={closeUpdateModal}
                  >
                    <Text style={styles.textStyle}>Cancelar</Text>
                  </TouchableHighlight>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={detailsModalVisible}
            onRequestClose={closeDetailsModal}
          >
            <View style={styles.centeredView}>
              <View style={[styles.modalView, styles.updateModalView, currentTheme === 'dark' ? styles.darkModalView : styles.lightModalView]}>
                <Text style={[styles.modalText, { fontSize:25, fontWeight: 'bold', color: colors.text }]}>Detalles de la tarea</Text>
                <Text style={[styles.modalText,{color: colors.text }]}>Id: {taskDetails?.id_task}</Text>
                <Text style={[styles.modalText,{color: colors.text }]}>Title: {taskDetails?.title}</Text>
                <Text style={[styles.modalText,{color: colors.text }]}>Description: {taskDetails?.description}</Text>
                <Text style={[styles.modalText,{color: colors.text }]}>Fecha de creacion: {taskDetails?.updatedAt}</Text>
                <Text style={[styles.modalText,{color: colors.text }]}>Fecha en que sera realizada: {taskDetails?.date}</Text>
                <Text style={[styles.modalText,{color: colors.text }]}>Estado de la tarea: {taskDetails?.state}</Text>
                <TouchableHighlight
                  style={{ ...styles.openButton,marginTop:15, width:'60%',backgroundColor: "#FFC0CB" }}
                  onPress={closeDetailsModal}
                >
                  <Text style={styles.textStyle}>Salir</Text>
                </TouchableHighlight>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const CreateTaskScreen = ({ onExitPress, onCreateTaskPress }: { onExitPress: () => void, onCreateTaskPress: () => void }) => {
  const { colors } = useContext(ThemeContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  }

  const hideDatePickerHandler = () => {
    setShowDatePicker(false);
  }

  const createTask = async () => {
    try {
      if (!title || !description || !date) {
        setMessage('Debes de completar todos los campos.');
        return;
      }

      setLoading(true);

      const taskData: NewTask = {
        title: title,
        description: description,
        date: date.toISOString().split('T')[0]
      };

      await UseCases.CreateTaskUseCase(TaskAdapterFetcher, taskData);

      setMessage('Tarea creada exitosamente');

      setTitle('');
      setDescription('');
      setDate(undefined);

      onCreateTaskPress();
    } catch (error) {
      setMessage('Error al crear la tarea');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.header, { color: colors.text }, { marginBottom: 45 }]}>Crear nueva tarea</Text>
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder="Título"
        placeholderTextColor={colors.text}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { color: colors.text, height: 100 }]}
        placeholder="Descripción"
        placeholderTextColor={colors.text}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />
      <TouchableOpacity
        onPress={showDatePickerHandler}
        style={[styles.datePicker, { borderColor: colors.text, borderWidth: 1, borderRadius: 5, margin: 5 }]}>
        <Text style={{ color: colors.text, margin: 5 }}>{date ? date.toISOString().split('T')[0] : 'Seleccione fecha de realización'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setDate(selectedDate);
            }
            hideDatePickerHandler();
          }}
        />
      )}
      {message !== '' && <Text style={[styles.message, { color: 'green' }]}>{message}</Text>}
      <View style={styles.buttonContainer}>
        <Button onPress={onExitPress} title="Salir" />
        <Button onPress={createTask} title="Crear" disabled={loading} />
      </View>
    </View>
  )
}


export default function App() {
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const toggleCreatingTask = () => {
    setIsCreatingTask(!isCreatingTask);
  }

  const exitCreatingTask = () => {
    setIsCreatingTask(false);
  }

  return (
    <AppState>
      {isCreatingTask ? (
        <CreateTaskScreen onExitPress={exitCreatingTask} onCreateTaskPress={toggleCreatingTask} />
      ) : (
        <TasksListScreen onCreateTaskPress={toggleCreatingTask} />
      )}
    </AppState>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    textAlign: 'center',
    paddingTop: 10,
    fontSize: 30,
    fontWeight: 'bold',
  },
  taskContainer: {
    marginVertical: 25,
    width: '90%',
    maxHeight: '80%',
  },
  taskItemContainer: {
    marginVertical: 10,
  },
  taskItem: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  taskText: {
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    width: '90%',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    alignContent: 'flex-start',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: '80%',
  },
  datePicker: {
    width: '80%',
  },
  message: {
    color: 'red',
    marginBottom: 10,
  },
  message_del: {
    color: 'green',
    marginBottom: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    margin: 5
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  updateModalView: {
    width: '80%',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  darkModalView: {
    backgroundColor: "#333",
  },

  lightModalView: {
    backgroundColor: "#f0f0f0",
  },
});
