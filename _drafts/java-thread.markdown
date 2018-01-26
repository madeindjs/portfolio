# Les threads en Java



~~~java
// src/file_watcher/File_watcher.java
package file_watcher;

import java.io.File;

public class File_watcher {

    public static void main(String[] args) throws InterruptedException {
        // create thread who continue to run during this 
        WorkerThread worker = new WorkerThread();
        File file = worker.getFileWatched();
        worker.start();

        // we just update file 10 times
        for (int i = 0; i > 10; i++) {
            Thread.sleep(1000);
            file.setLastModified(System.currentTimeMillis());
        }
    }
}

~~~


Maintenant il ne nous reste plus qu'à créer notre `WorkerThread` qui va étendre de `Thread`. La fonction `setDaemon(true)` permet de dire au `WorkerThread`

~~~java
// src/file_watcher/WorkerThread.java
package file_watcher;

import java.io.File;

public class WorkerThread extends Thread {

    public static final String FILENAME = "/tmp/thread";

    private File fileWatched;
    private long lastModified;

    public WorkerThread() {
        fileWatched = new File(FILENAME);
        lastModified = fileWatched.lastModified();
        setDaemon(false);
    }

    public void run() {

        // infinte loop
        while (true) {
            // check if file change
            if (lastModified < fileWatched.lastModified()) {
                System.out.println("file modified");
                lastModified = fileWatched.lastModified();
            }
            // wait
            try {
                sleep(500);
            } catch (InterruptedException e) {
                // handle exception here
            }
        }
    }

    public File getFileWatched() {
        return fileWatched;
    }

}

~~~


    run:
    file modified
    file modified
