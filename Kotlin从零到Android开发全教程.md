# Kotlin 从零到 Android 独立开发全教程

> 目标：系统掌握 Kotlin 语法、语言思想和 Android 现代开发栈，最终能独立分析需求、设计架构、完成应用、测试并发布。本文以 Kotlin/JVM 与 Jetpack Compose 为主，也说明传统 View/XML 的衔接点。

## 使用方法与学习路线

不要只读。每节的示例都应亲手输入并修改，完成练习后再进入下一阶段。

1. **语言基础（第 1～8 章）**：能写命令行程序，理解空安全、函数、类、集合和异常。
2. **进阶语法（第 9～15 章）**：掌握泛型、扩展、高阶函数、委托、DSL、协程与 Flow。
3. **Android（第 16～24 章）**：掌握 Compose、状态、导航、架构、网络、存储、测试和发布。
4. **毕业项目（第 25 章）**：独立完成“离线优先任务管理 App”。

建议周期：每天 1～2 小时，10～14 周。每学完一章，完成末尾练习并提交一次 Git 记录。

---

## 第 1 章：环境、程序结构与第一段 Kotlin

Android 开发安装 Android Studio（内含 JDK），新建项目时选择 Kotlin。练习纯语法可使用 IntelliJ IDEA、Android Studio 的 Scratch File，或 Kotlin Playground。

Kotlin 源文件以 `.kt` 结尾。程序从顶层 `main` 函数开始：

```kotlin
package com.example.learn

import kotlin.math.PI

fun main() {
    val radius = 3.0
    println("面积 = ${PI * radius * radius}")
}
```

- `package` 声明命名空间，通常与目录结构一致。
- `import` 导入名称；可用 `as` 起别名：`import java.util.Date as JavaDate`。
- 分号通常省略，注释有 `//`、`/* */` 和用于文档的 `/** */`。
- Kotlin 区分大小写，推荐类名用 `UpperCamelCase`，函数和变量用 `lowerCamelCase`，常量用 `UPPER_SNAKE_CASE`。

### 编译模型

Kotlin/JVM 编译成 JVM 字节码，与 Java 双向调用；Android 再把字节码转换为设备使用的格式。Kotlin 还可面向 JavaScript、Native 和 Multiplatform，但 Android 初学阶段先专注 JVM。

**练习**：输出姓名、学习目标和未来 30 天的学习时长；再定义一个计算圆周长的函数。

---

## 第 2 章：变量、常量、类型与运算符

### val 与 var

```kotlin
val language: String = "Kotlin" // 只读引用，优先使用
var level = 1                   // 可重新赋值，类型推断为 Int
level += 1

const val API_VERSION = "v1"   // 编译期常量，只能在顶层、object 或 companion object
```

`val` 表示引用不能更换，不代表对象内部不可变。尽量使用不可变数据，状态变化会更容易推理。

### 基本类型

整数：`Byte`、`Short`、`Int`、`Long`；浮点：`Float`、`Double`；另有 `Boolean`、`Char`、`String`。Kotlin 不做隐式数值扩大转换：

```kotlin
val count: Int = 42
val total: Long = count.toLong()
val hex = 0xFF
val binary = 0b1010
val readable = 1_000_000
val ratio = 3.14f
```

字符串可用模板和多行原始字符串：

```kotlin
val user = "Lin"
val message = "Hello, $user，明年你 ${20 + 1} 岁"
val json = """
    {
      "name": "$user"
    }
""".trimIndent()
```

### 运算符

- 算术：`+ - * / %`。整数相除仍为整数；需要小数先转 `Double`。
- 比较：`== != < <= > >=`；`==` 比内容，`===` 比引用身份。
- 逻辑：`&& || !`，支持短路。
- 区间：`1..10`、`1..<10`、`10 downTo 1`、`1..10 step 2`。
- 成员判断：`in`、`!in`；类型判断：`is`、`!is`。
- 位运算是命名函数：`shl`、`shr`、`ushr`、`and`、`or`、`xor`、`inv()`。

```kotlin
val score = 86
val passed = score in 60..100
val label = if (passed) "通过" else "重修"
```

Kotlin 可重载约定运算符，例如 `a + b` 对应 `a.plus(b)`，但应保持直觉语义。

**练习**：编写温度转换、BMI 计算器，并正确处理整数除法。

---

## 第 3 章：空安全与类型转换

空指针是 Android 崩溃的常见来源。Kotlin 把“可为空”编码进类型：`String` 不能为 null，`String?` 可以。

```kotlin
var nickname: String? = null
val length: Int? = nickname?.length             // 安全调用
val display = nickname ?: "未设置"               // Elvis 运算符
nickname?.let { println(it.uppercase()) }        // 非空才执行
```

常见工具：

- `?.`：安全访问；链中任何一环为 null，整体返回 null。
- `?:`：左侧为 null 时使用右侧；右侧也可 `return` 或 `throw`。
- `!!`：断言非空，错误会抛 NPE；业务代码应极少使用。
- `as?`：安全类型转换，失败返回 null；`as` 失败抛异常。

```kotlin
fun requireName(input: String?): String {
    return input?.trim()?.takeIf { it.isNotEmpty() }
        ?: throw IllegalArgumentException("姓名不能为空")
}

fun printLength(value: Any?) {
    if (value is String) {
        println(value.length) // 智能转换为 String
    }
}
```

### 平台类型

Java 代码返回的值可能显示为 `String!`，编译器无法判断其可空性。调用 Java/旧 Android API 时主动检查 null，不要盲用 `!!`。

**练习**：实现 `parseAge(text: String?): Int?`，只接受 0～150；分别用安全调用、`toIntOrNull` 和 Elvis 完成。

---

## 第 4 章：流程控制

Kotlin 的 `if`、`when`、`try` 都是表达式，可以直接产生值。

```kotlin
val max = if (a > b) a else b

val description = when (score) {
    100 -> "满分"
    in 90..99 -> "优秀"
    in 60..89 -> "合格"
    else -> "继续努力"
}

fun describe(x: Any) = when (x) {
    is Int -> "整数 $x"
    is String -> "长度 ${x.length} 的文本"
    null -> "空值"
    else -> "其他"
}
```

循环：

```kotlin
for (i in 0 until 5) println(i)
for ((index, value) in names.withIndex()) println("$index: $value")

var attempts = 3
while (attempts > 0) attempts--

outer@ for (row in 0..2) {
    for (col in 0..2) {
        if (row == col) continue@outer
    }
}
```

`break` 结束循环，`continue` 跳过本轮；标签可明确作用于哪一层循环或 lambda。优先用集合操作替代复杂循环，但不要为了“函数式”牺牲可读性。

**练习**：输出九九乘法表；使用 `when` 完成可扩展的命令解析器。

---

## 第 5 章：函数

```kotlin
fun greet(name: String, prefix: String = "你好"): String = "$prefix，$name"

fun main() {
    println(greet(name = "小林"))       // 命名参数
    println(greet("小林", "欢迎"))
}
```

### 参数规则

- 参数必须声明类型，默认是只读的。
- 支持默认参数和命名参数；调用 Java 方法时通常不能使用命名参数。
- `Unit` 类似“无有意义返回值”，可省略。
- `Nothing` 表示永不正常返回，如只会抛异常的函数。
- 顶层函数不必放在工具类中。

### 可变参数与中缀函数

```kotlin
fun sumAll(vararg numbers: Int) = numbers.sum()
val values = intArrayOf(1, 2, 3)
val total = sumAll(0, *values) // 展开数组

infix fun Int.percentOf(total: Int) = this * total / 100
val discount = 20 percentOf 500
```

### 局部函数、尾递归与重载

函数可以嵌套；`tailrec` 可优化满足条件的尾递归。可以同名重载，但仅返回类型不同不能构成重载。Android 中递归通常不如循环稳妥。

```kotlin
tailrec fun factorial(n: Long, acc: Long = 1): Long =
    if (n <= 1) acc else factorial(n - 1, acc * n)
```

**练习**：写一个支持默认税率、命名参数的订单总价函数；再实现最大公约数。

---

## 第 6 章：类、对象与构造

```kotlin
class User(
    val id: Long,
    name: String,
    var age: Int = 0
) {
    var name: String = name.trim()
        set(value) {
            require(value.isNotBlank())
            field = value.trim()
        }

    val isAdult: Boolean
        get() = age >= 18

    init {
        require(id > 0) { "id 必须为正数" }
    }

    constructor(id: Long, name: String) : this(id, name, 0)

    fun birthday() { age++ }
}
```

- 主构造器写在类名后，初始化逻辑放 `init`。
- `field` 是自定义访问器里的幕后字段。
- 没有 `new`，直接 `User(1, "Lin")`。
- Kotlin 类和成员默认 `final`；允许继承需显式 `open`，重写用 `override`。
- 可见性：`public`（默认）、`internal`（模块内）、`protected`、`private`。

### 继承与抽象

```kotlin
abstract class Animal(val name: String) {
    abstract fun sound(): String
    open fun introduce() = "$name: ${sound()}"
}

class Cat(name: String) : Animal(name) {
    override fun sound() = "喵"
}
```

优先组合而非深层继承。Android 状态对象通常用数据类，行为由 ViewModel/用例组织。

**练习**：设计 `BankAccount`，余额只能通过 `deposit` 和 `withdraw` 修改，并验证非法金额。

---

## 第 7 章：接口、数据类、枚举、密封类型与 object

### 接口

```kotlin
interface Repository<T> {
    suspend fun get(id: Long): T?
    fun isValidId(id: Long) = id > 0
}
```

接口可有默认实现但没有构造器。类可实现多个接口，冲突时用 `super<接口名>.方法()` 指定。

### 数据类与解构

```kotlin
data class Task(val id: Long, val title: String, val done: Boolean = false)

val task = Task(1, "学习 Kotlin")
val updated = task.copy(done = true)
val (id, title, done) = updated
```

数据类自动生成 `equals/hashCode/toString/componentN/copy`。主构造器至少有一个 `val/var` 参数。数组属性比较是引用语义，必要时使用内容比较函数。

### enum 与 sealed

```kotlin
enum class Priority(val weight: Int) { LOW(1), MEDIUM(2), HIGH(3) }

sealed interface UiState<out T> {
    data object Loading : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
}

fun render(state: UiState<List<Task>>) = when (state) {
    UiState.Loading -> "加载中"
    is UiState.Success -> "${state.data.size} 条"
    is UiState.Error -> state.message
}
```

`sealed` 限定可能的子类型，让 `when` 能穷尽检查，非常适合 UI 状态和事件。`enum` 适合固定同构常量。

### object 与伴生对象

```kotlin
object AppLogger { fun log(message: String) = println(message) }

class Token private constructor(val value: String) {
    companion object {
        fun parse(raw: String): Token? = raw.takeIf(String::isNotBlank)?.let(::Token)
    }
}
```

`object` 是线程安全惰性初始化的单例声明；对象表达式 `object : Listener { ... }` 用于匿名实现。避免把可变全局状态塞入单例。

**练习**：用密封接口建模登录的 Idle、Loading、Success、Error 四种状态。

---

## 第 8 章：数组、集合与序列

```kotlin
val readOnly = listOf("A", "B")
val mutable = mutableListOf("A")
mutable += "B"

val ids = setOf(1, 2, 2)                 // 去重
val users = mapOf(1L to "Lin", 2L to "Yu")
val ints = intArrayOf(1, 2, 3)           // 原生类型数组
```

只读接口不等于绝对不可变；不要把底层可变集合泄漏出去。常见操作：

```kotlin
val result = tasks
    .filterNot { it.done }
    .sortedByDescending { it.id }
    .map { it.title }

val byDone = tasks.groupBy(Task::done)
val idMap = tasks.associateBy(Task::id)
val first = tasks.firstOrNull { it.id == 1L }
val total = tasks.fold(0) { acc, _ -> acc + 1 }
```

`map` 保持一一映射，`flatMap` 展平多层；`any/all/none/count` 做条件统计；`zip` 合并相同位置；`chunked/windowed` 分块或滑窗。

大量链式操作可用 `Sequence` 延迟执行，减少中间集合：

```kotlin
val names = (1..1_000_000).asSequence()
    .filter { it % 2 == 0 }
    .map { "No.$it" }
    .take(5)
    .toList()
```

小集合不必滥用 Sequence；它有额外调用开销。

**练习**：对任务列表按完成状态分组，统计每组数量，并找出标题最长的未完成任务。

---

## 第 9 章：Lambda、高阶函数与函数类型

```kotlin
val square: (Int) -> Int = { value -> value * value }

fun calculate(a: Int, b: Int, operation: (Int, Int) -> Int): Int =
    operation(a, b)

val answer = calculate(3, 4) { x, y -> x + y }
```

最后一个参数是函数时可使用尾随 lambda；只有一个参数时可用 `it`。函数引用：`::println`、`String::length`、`user::birthday`。

### 闭包与返回

Lambda 能捕获外部变量。`forEach` 是内联函数，裸 `return` 可能从外层函数返回；用 `return@forEach` 仅跳过本次。复杂控制流更适合普通 `for`。

### inline、noinline、crossinline

```kotlin
inline fun <T> measure(block: () -> T): T {
    val start = System.nanoTime()
    return block().also { println(System.nanoTime() - start) }
}
```

`inline` 把函数体和 lambda 展开到调用处，可减少函数对象并支持非局部返回；`noinline` 禁止某个参数内联，`crossinline` 禁止非局部返回。只给短小高阶函数使用。

**练习**：实现 `retry(times, block)`；失败时重试，最终仍失败则抛出最后一次异常。

---

## 第 10 章：作用域函数与扩展

五个作用域函数本质都是高阶函数：

| 函数 | 对象引用 | 返回值 | 典型用途 |
|---|---|---|---|
| `let` | `it` | lambda 结果 | 空安全转换 |
| `run` | `this` | lambda 结果 | 配置并计算 |
| `with` | `this` | lambda 结果 | 对现有对象执行多步 |
| `apply` | `this` | 对象本身 | 构建/配置对象 |
| `also` | `it` | 对象本身 | 日志、校验等旁路动作 |

```kotlin
val intent = Intent(context, DetailActivity::class.java).apply {
    putExtra("task_id", task.id)
}

val normalized = input?.trim()?.takeIf { it.isNotEmpty() }
```

不要连续嵌套多个作用域函数，`this/it` 会难以辨认。

### 扩展函数与属性

```kotlin
fun String.toSafeInt(default: Int = 0) = trim().toIntOrNull() ?: default
val String.initial: Char? get() = firstOrNull()
```

扩展是静态分发，不会真正修改类，也不能访问其私有成员。成员函数与扩展同名时成员优先。扩展适合无状态、语义内聚的工具；不要制造难以追踪的“万能扩展”。

**练习**：为 `Long` 编写毫秒转 `mm:ss` 的扩展属性，并测试边界。

---

## 第 11 章：泛型、型变与类型系统进阶

```kotlin
class Box<T>(val value: T)

fun <T : Comparable<T>> maxOfTwo(a: T, b: T): T = if (a >= b) a else b

fun <T> requireBoth(value: T) where T : CharSequence, T : Comparable<T> = value
```

JVM 泛型通常发生类型擦除。Kotlin 用声明处型变表达安全关系：生产者 `out`，消费者 `in`。

```kotlin
interface Source<out T> { fun next(): T }
interface Sink<in T> { fun accept(value: T) }
```

- `List<Dog>` 可当作 `List<Animal>`，因为只读列表是 `List<out T>`。
- 可变列表既读又写，不能安全协变。
- 使用处投影：`Array<out Number>`、`Comparable<in String>`。
- 星投影 `List<*>` 表示元素类型未知，读取为 `Any?`。

### reified

```kotlin
inline fun <reified T> Any?.isType(): Boolean = this is T
```

普通泛型不能直接 `is T`；内联的 `reified` 类型参数会保留调用点类型。常用于 JSON 解析、导航和依赖获取。

### typealias 与值类

```kotlin
typealias TaskId = Long

@JvmInline
value class Email(val value: String)
```

`typealias` 只是别名，没有类型安全隔离；值类可创建轻量强类型，但要注意装箱、Java 互操作与序列化配置。

**练习**：设计泛型 `Result<T>`；写 `map` 函数把成功值转换、错误原样传递。

---

## 第 12 章：委托、运算符、解构与 DSL

### 属性委托

```kotlin
val config by lazy { loadConfig() }
var name by Delegates.observable("") { _, old, new ->
    println("$old -> $new")
}
```

自定义委托实现 `getValue`/`setValue`。Android 中 Compose 的 `by remember { mutableStateOf(...) }` 就依赖委托约定。

### 类委托

```kotlin
class LoggingRepository(
    private val delegate: Repository<Task>
) : Repository<Task> by delegate
```

类委托减少样板代码，适合装饰器，但覆写行为要保持清晰。

### 运算符约定与解构

可通过 `operator fun plus`、`get/set`、`contains`、`invoke` 等约定定制语法。`component1()` 等支持解构。业务领域对象可适度使用，避免“看不懂的魔法”。

### DSL

带接收者的函数类型 `T.() -> Unit` 是 Kotlin DSL 核心：

```kotlin
class RequestBuilder {
    var url = ""
    fun header(name: String, value: String) { /* ... */ }
}

fun request(block: RequestBuilder.() -> Unit) = RequestBuilder().apply(block)

val req = request {
    url = "https://example.com"
    header("Accept", "application/json")
}
```

`@DslMarker` 可限制嵌套 DSL 中错误的外层接收者访问。

**练习**：编写一个 `html { body { text("Hello") } }` 的微型 DSL。

---

## 第 13 章：异常、Result 与资源管理

Kotlin 没有受检异常。`throw` 和 `try` 都是表达式：

```kotlin
val number = try {
    input.toInt()
} catch (e: NumberFormatException) {
    0
} finally {
    println("解析结束")
}
```

只捕获能处理的具体异常，不要静默吞掉 `Exception`。参数/状态校验：

```kotlin
require(age >= 0) { "年龄不能为负" }
check(isInitialized) { "尚未初始化" }
val value = requireNotNull(nullable)
```

自动关闭资源用 `use`：

```kotlin
val text = file.bufferedReader().use { it.readText() }
```

`runCatching { ... }` 返回 `kotlin.Result`，适合局部转换，但大型业务错误更适合显式密封类型，区分网络错误、认证错误、验证错误等。

```kotlin
sealed interface AppError {
    data object Offline : AppError
    data class Server(val code: Int) : AppError
}
```

**练习**：把不可靠的文本读取包装成明确的 Success/Failure 类型，而不是返回 null。

---

## 第 14 章：Java 互操作、注解与反射

Kotlin 可直接使用 Java 类。关键点：

- Java getter/setter 常表现为 Kotlin 属性。
- `@JvmStatic` 暴露静态风格方法，`@JvmField` 暴露字段，`@JvmOverloads` 为默认参数生成重载。
- Java 关键字冲突用反引号，如 `foo.`is`() `。
- `@Throws(IOException::class)` 向 Java 声明异常。
- SAM 接口可用 lambda：`view.setOnClickListener { ... }`。

```kotlin
class ApiClient @JvmOverloads constructor(
    val baseUrl: String,
    val timeout: Long = 5_000
) {
    companion object {
        @JvmStatic fun create() = ApiClient("https://example.com")
    }
}
```

注解可指定使用点：`@field:Inject`、`@get:JsonName`、`@param:Named`。Android 常见编译时代码生成由 KSP 驱动。反射使用 `::class`，但 Android 上需关注体积与性能，优先代码生成。

**练习**：写一个供 Java 调用的 Kotlin 工具类，并检查生成的方法签名。

---

## 第 15 章：协程与 Flow

协程是可挂起、非阻塞的并发任务。`suspend` 表示函数可挂起，只能从协程或另一个挂起函数调用。

```kotlin
suspend fun loadUser(id: Long): User = withContext(Dispatchers.IO) {
    api.fetchUser(id)
}

viewModelScope.launch {
    try {
        val user = loadUser(1)
        _uiState.value = UiState.Success(user)
    } catch (e: CancellationException) {
        throw e
    } catch (e: IOException) {
        _uiState.value = UiState.Error("网络不可用")
    }
}
```

### 核心概念

- `CoroutineScope` 定义生命周期；Android 使用 `viewModelScope`、`lifecycleScope`。
- `launch` 返回 `Job`，无结果；`async` 返回 `Deferred<T>`，通过 `await()` 取结果。
- `Dispatchers.Main` 更新 UI；`IO` 阻塞 I/O；`Default` CPU 密集计算。
- `withContext` 切换上下文并返回结果；不要用 `GlobalScope`。
- 取消是协作式的；挂起函数会检查取消，CPU 循环用 `ensureActive()`/`yield()`。
- `coroutineScope` 子任务失败会取消兄弟；`supervisorScope` 隔离子任务失败。
- `CoroutineExceptionHandler` 不是普通 `try/catch` 的替代品。

并行请求：

```kotlin
suspend fun dashboard() = coroutineScope {
    val user = async { api.user() }
    val news = async { api.news() }
    Dashboard(user.await(), news.await())
}
```

### Flow

`Flow<T>` 是冷数据流，每次收集重新执行。`StateFlow` 保存最新状态，`SharedFlow` 广播事件/数据。

```kotlin
val tasks: Flow<List<Task>> = dao.observeTasks()
    .map { entities -> entities.map(TaskEntity::toDomain) }
    .distinctUntilChanged()

val uiState: StateFlow<TaskUiState> = combine(tasks, query) { list, q ->
    TaskUiState(list.filter { q in it.title })
}.stateIn(
    scope = viewModelScope,
    started = SharingStarted.WhileSubscribed(5_000),
    initialValue = TaskUiState()
)
```

常用操作符：`map/filter/transform`、`debounce`、`combine`、`zip`、`flatMapLatest`、`catch`、`retry`、`onStart`、`flowOn`。UI 在 Compose 中使用生命周期感知的 `collectAsStateWithLifecycle()`。

一次性 UI 事件要谨慎建模：导航常由状态变化触发；必须广播时使用带缓冲策略的 `SharedFlow`，不要用容易丢失事件的临时布尔值。

**练习**：制作搜索流：输入防抖 300ms，最新查询取消旧请求，错误转为 UI 状态。

---

## 第 16 章：Android 项目与组件基础

典型模块：

```text
app/
  src/main/
    AndroidManifest.xml
    java/com/example/app/
    res/
  build.gradle.kts
```

Gradle Kotlin DSL 文件使用 `.gradle.kts`。版本集中到 version catalog 可减少重复。应用最重要的组件：

- `Activity`：一个用户可进入的界面容器；Compose App 常用单 Activity。
- `Service`：后台长任务入口；普通延迟任务优先 WorkManager，持续用户可感知任务使用前台服务。
- `BroadcastReceiver`：接收系统/应用广播，执行时间要短。
- `ContentProvider`：跨进程共享结构化数据。

Manifest 声明组件、权限和 App 配置。运行时危险权限必须在使用前解释并请求；不要请求业务不需要的权限。

### 生命周期

Activity 典型回调：`onCreate → onStart → onResume`；离开时 `onPause → onStop → onDestroy`。配置变化可能重建 Activity，UI 状态应放 ViewModel/持久层或使用可保存状态，而不是依赖 Activity 字段。

### Context 与 Intent

`Context` 访问资源和系统服务。Activity Context 带界面主题且受生命周期约束；Application Context 生命周期与进程一致。不要让单例长期持有 Activity/View 引用。

Intent 可显式启动应用内组件，也可隐式请求系统能力。跨组件数据应小而可序列化，大数据存数据库/文件并传 ID 或 URI。

**练习**：新建空 Compose 项目，观察生命周期日志；旋转屏幕后验证 ViewModel 状态仍在。

---

## 第 17 章：Jetpack Compose UI

Compose 用 Kotlin 函数声明 UI：

```kotlin
@Composable
fun TaskRow(
    task: Task,
    onToggle: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onToggle(task.id) }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(
            checked = task.done,
            onCheckedChange = { onToggle(task.id) }
        )
        Spacer(Modifier.width(12.dp))
        Text(task.title, style = MaterialTheme.typography.bodyLarge)
    }
}
```

### 核心规则

- Composable 可能频繁重组；函数应快速、无副作用、结果由参数和状态决定。
- `Modifier` 顺序会改变结果，调用方传入的 modifier 通常放最外层。
- 状态向下、事件向上：无状态组件接收值与回调，屏幕层连接 ViewModel。
- 列表使用 `LazyColumn`，为动态项提供稳定 `key`。

```kotlin
LazyColumn(contentPadding = PaddingValues(16.dp)) {
    items(tasks, key = Task::id) { task ->
        TaskRow(task, onToggle)
    }
}
```

### 状态与 remember

```kotlin
var query by rememberSaveable { mutableStateOf("") }
OutlinedTextField(value = query, onValueChange = { query = it })
```

- `remember` 跨重组保留，不能跨进程/通常不能跨 Activity 重建。
- `rememberSaveable` 保存 Bundle 可支持的少量 UI 状态。
- 业务状态属于 ViewModel/数据库，不应堆在 Composable。
- 对已有状态的派生计算用 `derivedStateOf`（仅在能减少无效更新时）。

### 副作用

- `LaunchedEffect(key)` 启动随 key 变化取消重启的协程。
- `DisposableEffect` 注册并清理监听。
- `SideEffect` 在成功重组后同步外部对象。
- `rememberUpdatedState` 在不重启 effect 的情况下读取最新回调。
- `produceState` 把异步源转为 Compose State。

### 主题、无障碍与适配

使用 Material 3 的颜色、排版、形状；支持深色模式和动态色。交互目标足够大，图片提供 `contentDescription`，自定义组件补充 semantics。使用 WindowSizeClass/自适应布局处理手机、平板和折叠屏；不要按固定像素设计。

**练习**：实现任务列表、空状态、加载状态、错误状态、搜索框与深色主题预览。

---

## 第 18 章：Navigation 与页面通信

Compose Navigation 用路由组织目的地。原则：只传 ID 等最小参数，在目标页面从数据层重新加载；不要把完整对象塞进路由。

```kotlin
@Composable
fun AppNavHost(navController: NavHostController) {
    NavHost(navController, startDestination = "tasks") {
        composable("tasks") {
            TaskListScreen(onOpen = { id -> navController.navigate("task/$id") })
        }
        composable(
            route = "task/{id}",
            arguments = listOf(navArgument("id") { type = NavType.LongType })
        ) { entry ->
            TaskDetailRoute(id = entry.arguments?.getLong("id") ?: return@composable)
        }
    }
}
```

项目允许时优先使用类型安全路由。处理返回栈、深链和恢复：

- 登录后清理登录页：`popUpTo` 配合 `inclusive`。
- 底部导航保存各 tab 状态并避免重复目的地。
- Deep Link 输入是不可信数据，必须验证参数与权限。
- 导航动作由屏幕边界处理，纯 UI 组件只发事件。

**练习**：实现列表→详情→编辑，保存后返回并让列表自动更新。

---

## 第 19 章：架构、ViewModel 与依赖注入

推荐分层（按复杂度裁剪）：

```text
UI (Compose + ViewModel)
        ↓
Domain（用例 + 领域模型，可选）
        ↓
Data（Repository + 本地/远程数据源）
```

单向数据流：ViewModel 暴露不可变 `StateFlow<UiState>`；UI 发送事件；ViewModel 调用用例/仓库并更新状态。

```kotlin
data class TaskUiState(
    val tasks: List<Task> = emptyList(),
    val loading: Boolean = false,
    val message: String? = null
)

sealed interface TaskAction {
    data class Toggle(val id: Long) : TaskAction
    data class Search(val text: String) : TaskAction
}

class TaskViewModel(
    private val repository: TaskRepository
) : ViewModel() {
    val state = repository.observeAll()
        .map { TaskUiState(tasks = it) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), TaskUiState(loading = true))

    fun onAction(action: TaskAction) {
        when (action) {
            is TaskAction.Toggle -> viewModelScope.launch { repository.toggle(action.id) }
            is TaskAction.Search -> Unit
        }
    }
}
```

### Repository 与单一事实源

Repository 隐藏数据来源。离线优先 App 通常让数据库成为单一事实源：UI 观察数据库；同步器从网络更新数据库，而不是同时让 UI 拼接两个来源。

### 依赖注入

构造器注入最易测试。大型 Android 项目可用 Hilt 管理对象图和生命周期；小项目可手工组装。不要把 Service Locator 当成无处不在的全局变量。

```kotlin
@HiltViewModel
class TaskViewModel @Inject constructor(
    private val repository: TaskRepository
) : ViewModel()
```

**练习**：把内存仓库注入 ViewModel，写 fake 替换真实实现，并验证状态变化。

---

## 第 20 章：网络、序列化与安全

常见组合是 HTTP 客户端/Retrofit + Kotlin 序列化或 Moshi。DTO、数据库实体和领域模型分离可隔离后端/存储变化。

```kotlin
@Serializable
data class TaskDto(
    val id: Long,
    val title: String,
    @SerialName("is_done") val done: Boolean
)

interface TaskApi {
    @GET("tasks")
    suspend fun tasks(): List<TaskDto>
}
```

Repository 负责映射与错误：

```kotlin
suspend fun refresh() {
    val remote = api.tasks()
    dao.replaceAll(remote.map(TaskDto::toEntity))
}
```

生产质量要求：

- 设置连接/读取超时；只对幂等请求谨慎重试并加退避。
- 区分无网、超时、HTTP 状态、解析失败和业务错误。
- 不在日志打印 token、密码和个人信息。
- 仅使用 HTTPS；密钥不能安全地硬编码在客户端，真正机密放服务端。
- 鉴权 token 使用合适的加密/系统凭据能力，处理过期刷新并避免并发刷新风暴。
- 分页使用 Paging；大文件使用流式读写并支持取消。

**练习**：用 Fake API 模拟 200、401、500、超时和格式错误，为每种情况产生明确 UI 状态。

---

## 第 21 章：Room、DataStore、文件与离线优先

### Room

```kotlin
@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey val id: Long,
    val title: String,
    val done: Boolean,
    val updatedAt: Long
)

@Dao
interface TaskDao {
    @Query("SELECT * FROM tasks ORDER BY updatedAt DESC")
    fun observeAll(): Flow<List<TaskEntity>>

    @Upsert
    suspend fun upsertAll(items: List<TaskEntity>)

    @Query("UPDATE tasks SET done = :done WHERE id = :id")
    suspend fun setDone(id: Long, done: Boolean)
}
```

数据库操作应离开主线程。版本升级必须提供 migration 并测试；生产应用不要用破坏性迁移丢用户数据。多步原子操作用 `@Transaction`。

### DataStore

Preferences DataStore 适合少量无模式设置；Proto DataStore 适合强类型配置。它们不是复杂关系数据的数据库。不要用旧式 SharedPreferences 承担新项目的响应式配置需求。

### 文件与 URI

应用私有文件无需存储权限。用户选择文档使用系统文件选择器和内容 URI；不要假设 URI 是真实文件路径。共享文件使用 FileProvider，不暴露 `file://`。

### 离线同步

写入先落本地并标记待同步；WorkManager 在网络可用时上传。需要设计冲突策略：最后写入胜出、字段合并、服务端版本号或人工处理。任务需幂等，避免重试造成重复记录。

**练习**：完成 Room CRUD，杀进程后数据仍存在；再为数据库写迁移测试。

---

## 第 22 章：后台任务、通知与系统集成

- **WorkManager**：可延迟、要求最终执行的约束任务，如同步、上传、清理。
- **前台服务**：用户明确感知且必须持续的工作，如导航/媒体；必须展示通知并遵守对应服务类型规定。
- **普通协程**：只在页面或进程生命周期内完成的任务。

```kotlin
val request = PeriodicWorkRequestBuilder<SyncWorker>(12, TimeUnit.HOURS)
    .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED))
    .build()

WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "task-sync",
    ExistingPeriodicWorkPolicy.KEEP,
    request
)
```

Worker 返回 `success/failure/retry`；重试需退避，输入输出数据应小。通知要创建 channel（支持的系统版本）、请求必要权限、提供有意义操作，并避免打扰。闹钟只用于用户可感知且时间精确的场景。

**练习**：添加网络约束的唯一同步任务，重复点击同步也不会排队多个实例。

---

## 第 23 章：测试、调试与质量

测试金字塔：大量快速单元测试，适量集成测试，少量关键 UI 测试。

```kotlin
class ToggleTaskUseCaseTest {
    @Test
    fun `toggle changes task state`() = runTest {
        val repo = FakeTaskRepository(Task(1, "Learn", false))
        ToggleTaskUseCase(repo)(1)
        assertTrue(repo.task.done)
    }
}
```

协程测试使用测试调度器和 `runTest`；Flow 可直接 `first()`、`take(n).toList()` 或使用合适测试工具。测试不要依赖真实时间和网络。

Compose 测试通过语义查找：

```kotlin
composeRule.onNodeWithText("学习 Kotlin").assertIsDisplayed()
composeRule.onNodeWithContentDescription("完成任务").performClick()
```

应覆盖：

- 领域规则和边界值。
- ViewModel 的 Loading/Success/Error 与取消。
- Repository 的缓存、映射、重试、离线与冲突。
- Room migration。
- 关键用户流程和无障碍语义。

调试时先稳定复现，再看堆栈最内层业务原因；使用结构化日志、断点、Profiler 和布局检查器。Release 构建也要测试，混淆和资源压缩可能引入差异。

**练习**：为搜索 ViewModel 写虚拟时间测试，证明防抖和取消旧请求都正确。

---

## 第 24 章：性能、安全、构建与发布

### 性能

- 不在主线程做网络、数据库或大型 JSON/图片处理。
- Compose 保持参数稳定、列表 key 稳定；先测量再用 `remember` 优化。
- 图片按显示尺寸加载，分页大列表，避免一次读入大文件。
- 用基准与启动分析定位真实瓶颈，不凭感觉“优化”。
- 关注冷启动、卡顿、内存泄漏、耗电和网络流量。

### 安全与隐私

- 最小权限；校验所有外部 Intent、深链、网络和文件输入。
- 敏感组件不应导出；确需导出时设置权限并验证调用方。
- 不提交签名文件、服务账号、真实密钥和用户数据到 Git。
- 日志与崩溃报告脱敏；提供隐私说明和数据删除路径。
- 依赖保持更新并检查已知漏洞，但升级先测试。

### 构建

区分 `debug/release` build type 与 `dev/prod` flavor。环境 URL 可通过 BuildConfig 或资源注入，但“隐藏在 App 中”的值都不能当服务端秘密。Release 开启合理的代码压缩，维护必要 keep 规则。

### 发布检查单

1. 唯一 applicationId、版本号、图标、名称、商店素材。
2. 生成并安全备份上传密钥；保留恢复方案。
3. 真机覆盖低版本、目标版本、深色、横屏、平板、弱网、无网和低内存。
4. 检查权限、隐私、安全表单、内容分级与目标 API 要求。
5. 先内部测试，再小比例发布，观察崩溃/ANR 和业务指标后扩量。
6. 建立回滚、热修复和数据迁移方案。

**练习**：生成 signed release，安装到真机并完成一次离线→联网同步全流程。

---

## 第 25 章：毕业项目——离线优先任务管理 App

### 功能验收

- 任务的新增、查看、编辑、删除、完成、搜索、筛选和排序。
- Room 持久化，重启/杀进程后不丢失。
- Compose Material 3，自适应列表/详情布局，深色主题和无障碍。
- ViewModel + StateFlow 单向数据流，Repository 隔离数据源。
- 模拟或真实 REST API，同步失败可重试、无网可继续编辑。
- WorkManager 后台同步，通知可选。
- 单元测试、Repository 集成测试、Room migration 测试、关键 UI 测试。
- Release 构建无敏感日志，README 说明架构、运行和权衡。

### 推荐结构

```text
com.example.tasks/
  app/                 # Application、导航、主题、DI
  feature/tasks/       # screen、component、ViewModel、UiState、Action
  domain/              # Task、Repository 接口、用例
  data/local/          # Room entity、DAO、database
  data/remote/         # API、DTO
  data/repository/     # Repository 实现、映射、同步
  worker/              # WorkManager
```

### 迭代计划

1. 先画数据流和页面状态；定义 `Task`、Repository 接口与 Fake。
2. 用 Fake 完成 Compose 列表/详情/编辑和导航。
3. 接入 Room，让数据库成为单一事实源。
4. 接入远程 API 和映射，设计错误模型。
5. 加入离线写入、同步队列、幂等和冲突策略。
6. 补测试、无障碍、平板布局、性能和发布配置。

### 完成定义

“能运行”不等于完成。每个功能必须有明确空/加载/错误/内容状态；旋转、返回、杀进程、无网、重复点击均行为正确；关键规则有自动化测试；另一位开发者只看 README 就能构建项目。

---

## Kotlin 语法速查

```kotlin
// 变量与空安全
val fixed: Int = 1
var changeable = 2
val nullable: String? = null
val length = nullable?.length ?: 0

// 表达式与类型检查
val result = if (fixed > 0) "yes" else "no"
val kind = when (val x: Any = "K") {
    is String -> x.length
    else -> 0
}

// 函数、默认参数、可变参数
fun add(a: Int, b: Int = 0) = a + b
fun sum(vararg values: Int) = values.sum()

// 类体系
data class User(val id: Long, val name: String)
sealed interface State { data object Loading : State }
object Singleton
@JvmInline value class UserId(val value: Long)

// 集合与高阶函数
val names = users.filter { it.id > 0 }.map(User::name)

// 扩展与泛型
fun String.nonBlankOrNull() = trim().takeIf(String::isNotEmpty)
inline fun <reified T> Any?.castOrNull(): T? = this as? T

// 协程与流
viewModelScope.launch { repository.refresh() }
val state = repository.observe().stateIn(viewModelScope, started, emptyList())
```

---

## 常见错误清单

1. 到处使用 `!!`；应建模可空性或提前返回。
2. 默认使用 `var` 和可变集合；应优先不可变数据与 `copy`。
3. 在 Composable 中直接发网络请求；应放进 ViewModel，并用 Effect 管理必要副作用。
4. 使用 `GlobalScope`；应绑定生命周期。
5. 捕获所有异常后不处理取消；协程中应重新抛出 `CancellationException`。
6. UI 同时把网络和数据库当事实源；离线优先时应观察数据库。
7. 导航传完整对象；应传 ID。
8. 单例持有 Activity；会造成内存泄漏。
9. 把 API key 写入 App 就认为安全；客户端内容都可被提取。
10. 只在模拟器和 Debug 测试；发布前必须覆盖真机与 Release。

---

## 独立开发能力自检

当你能不照抄教程完成以下内容，就具备独立开发基础：

- 能解释空安全、型变、扩展、内联、委托、协程取消和冷/热流。
- 能把页面拆成无状态 Composable，并设计完整 UiState/Action。
- 能用 ViewModel、Repository、Room、网络 API 建立可测试的数据流。
- 能处理生命周期、进程重建、权限、深链、离线和后台同步。
- 能写关键测试、定位 ANR/崩溃/泄漏、完成签名和发布检查。
- 遇到新库时能阅读官方文档、判断生命周期和线程模型，而不是只找复制代码。

最后建议：先完成一个小而完整的 App，再做第二个带登录、分页、上传和推送的 App。独立开发能力来自“完整交付闭环”，不是记住所有 API。
